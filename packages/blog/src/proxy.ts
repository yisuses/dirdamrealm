import { createProxy } from 'next-i18next/proxy'
import { type NextRequest, NextResponse } from 'next/server'

import { i18nConfig } from '@blog/core/i18n/config'
// Imported by path rather than through `@blog/utils` so the proxy bundle does not pull in
// the whole utils barrel.
import { isServeablePath } from '@blog/utils/isServeablePath/isServeablePath'

// Next 16 `proxy.ts` (formerly `middleware.ts`). next-i18next resolves the locale from
// the url/cookie/Accept-Language, rewrites the default locale to the hidden `/es` segment
// and sets the `x-i18next-current-language` header for Server Components.
const i18nProxy = createProxy(i18nConfig)

export default function proxy(req: NextRequest) {
  // Answer impossible urls here instead of letting them reach the app. `[postName]` and
  // `[categoryName]` are ISR cache keys and `dynamicParams` is on, so rendering one —
  // even only to return a redirect or a 404 — writes a cache entry and burns an ISR
  // write unit. Unbounded junk urls are what blew this project's write quota.
  if (!isServeablePath(req.nextUrl.pathname)) {
    return new NextResponse(null, { status: 404 })
  }

  return i18nProxy(req)
}

export const config = {
  // Skip Next internals, api routes, the sitemap routes and everything in `public/`
  // (favicon.ico, images/, locales/). These are prefix exclusions on purpose: the
  // previous `.*\..*` form skipped any path *containing* a dot, so urls such as
  // `/sitemap_index.xml/post/1/junk/` bypassed the proxy and were rendered — and
  // ISR-cached — by the app instead.
  matcher: ['/((?!api|_next|static|locales|images|favicon|sitemap\\.xml|sitemap/).*)'],
}
