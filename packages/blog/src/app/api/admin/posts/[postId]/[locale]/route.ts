import { parseAuthRequest, requireAuth } from '@blog/core/api/parseRequest'
import { revalidatePublicContent } from '@blog/core/cache/revalidatePublicContent'
import { localeSchema, postActionSchema, postSaveSchema } from '@blog/core/validation/post'
import { isUuid } from '@blog/core/validation/uuid'
import { applyPostAction, createTranslation, savePost } from '@blog/db/queries/admin/posts'

interface Context {
  params: Promise<{ postId: string; locale: string }>
}

const notFound = () => Response.json({ error: 'La entrada no existe' }, { status: 404 })

async function target(params: Context['params']) {
  const { postId, locale } = await params
  const parsedLocale = localeSchema.safeParse(locale)
  return isUuid(postId) && parsedLocale.success ? { postId, locale: parsedLocale.data } : undefined
}

/** Adds this language to the post. */
export async function POST(_request: Request, { params }: Context) {
  const authResult = await requireAuth()
  if (!authResult.ok) {
    return authResult.response
  }
  const found = await target(params)
  if (!found || !(await createTranslation(found.postId, found.locale))) {
    return Response.json({ error: 'La entrada no existe o ya tiene ese idioma' }, { status: 409 })
  }
  return new Response(null, { status: 201 })
}

/** The editor's save. Never changes the site: see `savePost`. */
export async function PUT(request: Request, { params }: Context) {
  const parsed = await parseAuthRequest(request, postSaveSchema)
  if (!parsed.ok) {
    return parsed.response
  }
  const found = await target(params)
  const savedAt = found && (await savePost(found.postId, found.locale, parsed.data))
  return savedAt ? Response.json({ savedAt }) : notFound()
}

/** Publish, unpublish, discard the pending edits, or (un)schedule this language. */
export async function PATCH(request: Request, { params }: Context) {
  const parsed = await parseAuthRequest(request, postActionSchema)
  if (!parsed.ok) {
    return parsed.response
  }
  const found = await target(params)
  if (!found) {
    return notFound()
  }
  const result = await applyPostAction(found.postId, found.locale, parsed.data)
  if (!result.ok) {
    return Response.json({ error: result.error }, { status: result.status })
  }
  if (result.changedSite) {
    revalidatePublicContent()
  }
  return Response.json({ ok: true })
}
