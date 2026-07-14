import { createProxy } from 'next-i18next/proxy'

import { i18nConfig } from '@blog/core/i18n/config'

// Next 16 `proxy.ts` (formerly `middleware.ts`). next-i18next resolves the locale from
// the url/cookie/Accept-Language, rewrites the default locale to the hidden `/es` segment
// and sets the `x-i18next-current-language` header for Server Components.
export default createProxy(i18nConfig)

export const config = {
  // Skip Next internals, api routes, sitemaps and anything with a file extension.
  matcher: ['/((?!api|_next|static|.*\\..*).*)'],
}
