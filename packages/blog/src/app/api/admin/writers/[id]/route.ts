import { parseAuthRequest, requireAuth } from '@blog/core/api/parseRequest'
import { revalidatePublicContent } from '@blog/core/cache/revalidatePublicContent'
import { isUuid } from '@blog/core/validation/uuid'
import { writerSchema } from '@blog/core/validation/writer'
import { deleteWriter, findWriterConflict, getWriterForAdmin, updateWriter } from '@blog/db/queries/admin/writers'

interface Context {
  params: Promise<{ id: string }>
}

const notFound = () => Response.json({ error: 'El autor no existe' }, { status: 404 })

export async function PUT(request: Request, { params }: Context) {
  const parsed = await parseAuthRequest(request, writerSchema)
  if (!parsed.ok) {
    return parsed.response
  }
  const { id } = await params
  if (!isUuid(id)) {
    return notFound()
  }
  const conflict = await findWriterConflict(parsed.data, id)
  if (conflict) {
    return Response.json({ error: conflict }, { status: 409 })
  }
  if (!(await updateWriter(id, parsed.data))) {
    return notFound()
  }
  // The writer's name and links are on their post pages.
  revalidatePublicContent()
  return Response.json({ id })
}

/** A writer who signs posts is only deleted with `?confirm=true`, after the panel warned about it. */
export async function DELETE(request: Request, { params }: Context) {
  const authResult = await requireAuth()
  if (!authResult.ok) {
    return authResult.response
  }
  const { id } = await params
  const writer = isUuid(id) ? await getWriterForAdmin(id) : undefined
  if (!writer) {
    return notFound()
  }
  if (writer.posts > 0 && new URL(request.url).searchParams.get('confirm') !== 'true') {
    return Response.json({ error: 'El autor firma entradas', posts: writer.posts }, { status: 409 })
  }
  await deleteWriter(id)
  revalidatePublicContent()
  return new Response(null, { status: 204 })
}
