import * as sentry from '@sentry/nextjs'
import { revalidatePath } from 'next/cache'
import { after } from 'next/server'
import { timingSafeEqual } from 'node:crypto'

import { getPostById } from '@blog/api'
import { DEFAULT_LOCALE, LOCALES } from '@blog/core/i18n/config'
import { buildCategoryPath, buildPostPath, publicUrl } from '@blog/utils'

/**
 * Expires the page caches that Strapi content feeds, so an edit or a new entry shows up
 * without a rebuild. Called by a Strapi webhook on entry publish/update/unpublish/delete.
 *
 * The pages carry a long `revalidate` (a backstop, not the refresh mechanism) because
 * time-based revalidation rewrites every visited url on every window, and that — with an
 * unbounded url space — is what exhausted the project's ISR write quota.
 */

// Route *patterns*, not urls: `type: 'page'` expires every generated instance, so no slug
// has to be rebuilt here from the webhook payload.
const dynamicRoutes = [
  '/[lng]',
  '/[lng]/archive',
  '/[lng]/category/[categoryCode]/[categoryName]',
  '/[lng]/post/[postId]/[postName]',
]

const staticRoutes = ['/sitemap.xml', '/sitemap/post.xml', '/sitemap/page.xml', '/sitemap/category.xml']

/** The subset of a Strapi webhook body this route reads. */
interface StrapiWebhookPayload {
  model?: string
  entry?: {
    id?: number
    publishedAt?: string | null
    code?: string
    name?: string
    translations?: Partial<Record<AppLocales, string>>
  }
}

function localePrefix(lng: AppLocales) {
  return lng === DEFAULT_LOCALE ? '' : `/${lng}`
}

async function getPublishedPost(id: number) {
  try {
    return await getPostById({ id })
  } catch (error) {
    sentry.captureException(error)
    return undefined
  }
}

/**
 * The public urls an edit is most likely to be checked on: the home and the archive in every
 * locale, plus the post and its categories, or the category, that the event is about.
 *
 * A post is looked up in Strapi rather than built from the payload: the webhook does not
 * carry its categories, and only the published entry has the id its url is built from.
 */
export async function pathsToWarm({ model, entry }: StrapiWebhookPayload): Promise<string[]> {
  const paths = LOCALES.flatMap(lng => [`${localePrefix(lng)}/`, `${localePrefix(lng)}/archive/`])

  if (model === 'post' && entry?.id && entry.publishedAt) {
    const post = await getPublishedPost(entry.id)
    if (post) {
      const prefix = localePrefix(post.locale)
      paths.push(`${prefix}${buildPostPath(post.id, post.title)}`)
      post.categories?.forEach(category =>
        paths.push(`${prefix}${buildCategoryPath(category.code, category.localizedName)}`),
      )
    }
  }

  if (model === 'category' && entry?.code && entry.name) {
    const { code, name, translations } = entry
    LOCALES.forEach(lng => paths.push(`${localePrefix(lng)}${buildCategoryPath(code, translations?.[lng] || name)}`))
  }

  return paths
}

async function readPayload(request: Request): Promise<StrapiWebhookPayload> {
  try {
    return (await request.json()) ?? {}
  } catch {
    return {}
  }
}

function secretMatches(provided: string | null, expected: string) {
  if (!provided) {
    return false
  }

  // `timingSafeEqual` throws unless both buffers are the same length.
  const providedBytes = Buffer.from(provided)
  const expectedBytes = Buffer.from(expected)
  return providedBytes.length === expectedBytes.length && timingSafeEqual(providedBytes, expectedBytes)
}

export async function POST(request: Request) {
  // Trimmed because a secret pasted through a dashboard commonly picks up a trailing
  // newline, and HTTP strips whitespace around header values -- so an untrimmed one
  // could never be matched by any client, leaving the route permanently unreachable.
  const expected = process.env.REVALIDATE_SECRET?.trim()

  // Fail closed: an open endpoint would let anyone expire every page at will, and each
  // regeneration costs an ISR write unit.
  if (!expected) {
    sentry.captureException('Revalidate - REVALIDATE_SECRET is not configured')
    return Response.json({ message: 'Revalidation is not configured' }, { status: 503 })
  }

  if (!secretMatches(request.headers.get('x-revalidate-secret'), expected)) {
    return Response.json({ message: 'Unauthorized' }, { status: 401 })
  }

  dynamicRoutes.forEach(route => revalidatePath(route, 'page'))
  staticRoutes.forEach(route => revalidatePath(route))

  // From a Route Handler `revalidatePath` only marks pages stale: the next visit is still
  // served the old page while it regenerates in the background. Make that visit here, after
  // the response, so the regeneration starts now and the editor sees the change on their
  // first look. A handful of pages, so a handful of ISR writes per Strapi save.
  const payload = await readPayload(request)
  after(async () => {
    const paths = await pathsToWarm(payload)
    await Promise.allSettled(paths.map(path => fetch(publicUrl(path), { cache: 'no-store' })))
  })

  return Response.json({ revalidated: true, at: new Date().toISOString() })
}
