import type { ServerResponse } from 'http'

export type CacheControlOptions = {
  /** Seconds the CDN may serve the cached response without revalidating. */
  sMaxAge?: number
  /** Seconds the CDN may keep serving a stale response while it revalidates in the background. */
  staleWhileRevalidate?: number
}

/**
 * Sets an edge cache policy on a `getServerSideProps` response so Vercel's CDN serves it from
 * cache instead of invoking the origin function on every request.
 *
 * By default Next.js marks SSR responses as `private, no-cache`, so every hit reaches Vercel
 * Compute and transfers the full props payload (this is what "Fast Origin Transfer" measures).
 * For content that changes rarely (blog pages, sitemaps) an `s-maxage` + `stale-while-revalidate`
 * policy collapses that cost: repeated hits (crawlers, uptime monitors, users) are answered from
 * the CDN, and the origin is invoked at most once per `sMaxAge` window.
 *
 * Only call this on successful responses — never on 404/500 or you would cache the error at the edge.
 *
 * @see https://vercel.com/docs/edge-network/caching#stale-while-revalidate
 */
export function setCacheControl(
  res: ServerResponse,
  { sMaxAge = 600, staleWhileRevalidate = 86400 }: CacheControlOptions = {},
) {
  res.setHeader('Cache-Control', `public, s-maxage=${sMaxAge}, stale-while-revalidate=${staleWhileRevalidate}`)
}
