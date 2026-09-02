/* eslint-disable @typescript-eslint/naming-convention */
import { LOCALES } from '@blog/core/i18n/config'

// Top-level sections this site serves under the (optional) locale prefix. `categoria` is
// the legacy spanish alias rewritten to `category` in next.config.js.
const SECTIONS: readonly string[] = ['archive', 'category', 'categoria', 'post']

// `seoName()` slugifies with `{ strict: true, lower: true }`, so a canonical slug is only
// `[a-z0-9]` groups joined by single hyphens. Anything else can never match one.
const CANONICAL_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const MAX_SLUG_LENGTH = 120
const POST_ID = /^[0-9]{1,9}$/
const CATEGORY_CODE = /^[A-Z]{1,16}$/

// Not pages: served from `public/` or by a route handler, and already listed in
// `i18nConfig.ignoredPaths`. Kept here so the guard never shadows them.
const NON_PAGE_PATHS: readonly string[] = ['/robots.txt']

/**
 * Whether `pathname` can possibly resolve to a page of this site.
 *
 * `[postName]` and `[categoryName]` are part of the ISR cache key and `dynamicParams` is
 * on, so every distinct url renders and writes a cache entry — even when the page only
 * answers with a redirect or a 404. Rejecting impossible urls in the proxy, before the
 * cache, is what keeps that key space bounded.
 */
export function isServeablePath(pathname: string): boolean {
  if (NON_PAGE_PATHS.includes(pathname)) {
    return true
  }

  const segments = pathname.split('/').filter(Boolean)

  // `/en/post/1/x` and `/post/1/x` (the default locale has no prefix) describe the same
  // section path.
  if (segments.length > 0 && (LOCALES as readonly string[]).includes(segments[0])) {
    segments.shift()
  }

  // `/` and `/en` are the home page.
  if (segments.length === 0) {
    return true
  }

  const [section, id, slug, ...extra] = segments
  if (!SECTIONS.includes(section) || extra.length > 0) {
    return false
  }

  // `/post` and `/category` are list pages; `/archive` takes no params at all.
  if (id === undefined) {
    return true
  }
  if (section === 'archive') {
    return false
  }

  const idIsValid = section === 'post' ? POST_ID.test(id) : CATEGORY_CODE.test(id)
  if (!idIsValid) {
    return false
  }

  return slug === undefined || (slug.length <= MAX_SLUG_LENGTH && CANONICAL_SLUG.test(slug))
}
