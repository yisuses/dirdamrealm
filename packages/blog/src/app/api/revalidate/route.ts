import * as sentry from '@sentry/nextjs'
import { revalidatePath } from 'next/cache'
import { timingSafeEqual } from 'node:crypto'

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

function secretMatches(provided: string | null, expected: string) {
  if (!provided) {
    return false
  }

  // `timingSafeEqual` throws unless both buffers are the same length.
  const providedBytes = Buffer.from(provided)
  const expectedBytes = Buffer.from(expected)
  return providedBytes.length === expectedBytes.length && timingSafeEqual(providedBytes, expectedBytes)
}

export function POST(request: Request) {
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

  return Response.json({ revalidated: true, at: new Date().toISOString() })
}
