/* eslint-disable @typescript-eslint/naming-convention */
import type { I18nConfig } from 'next-i18next/proxy'

// Shared i18n config. Uses a `import type` only (no runtime `next-i18next` import) so this
// module stays free of `next/server` — it is imported from client components and the test
// runner as well as src/proxy.ts and Server Components.
export const LOCALES = ['es', 'en'] as const
export const DEFAULT_LOCALE = 'es'
export const NAMESPACES = ['common', 'homePage', 'postPage', 'categoryPage', 'archivePage', 'errorPage'] as const

// The proxy matcher ignores paths containing a dot (static files), so a url like
// `/sitemap_index.xml/post/1/x/` reaches the `[lng]` routes without a locale rewrite and the
// segment holds arbitrary text. Never trust it as a locale without checking.
export function isAppLocale(value: string | undefined): value is AppLocales {
  return !!value && (LOCALES as readonly string[]).includes(value)
}

export const i18nConfig: I18nConfig = {
  supportedLngs: [...LOCALES],
  fallbackLng: DEFAULT_LOCALE,
  defaultNS: 'common',
  ns: [...NAMESPACES],
  localeInPath: true,
  // Default locale (es) has NO url prefix (`/`, `/archive/`), other locales are
  // prefixed (`/en`, `/en/archive/`). Preserves the existing Pages Router urls & SEO.
  hideDefaultLocale: true,
  ignoredPaths: ['/api', '/_next', '/static', '/sitemap', '/locales', '/images', '/robots.txt', '/favicon'],
}
