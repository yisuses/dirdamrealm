'use client'

import { DEFAULT_LOCALE } from '@blog/core/i18n/config'
import { useLocale } from '@blog/hooks/useLocale'

/**
 * Prefixes an internal path with the locale segment for non-default locales
 * (`/post/1/x/` -> `/en/post/1/x/`). App Router has no automatic locale prefixing
 * on next/link (unlike the Pages Router `i18n` config), so internal links must be
 * localized explicitly or they resolve to the default locale.
 */
export function localizeHref(path: string, locale: AppLocales): string {
  if (locale === DEFAULT_LOCALE || !path.startsWith('/')) return path
  if (path === `/${locale}` || path.startsWith(`/${locale}/`)) return path
  return `/${locale}${path}`
}

export function useLocalizeHref() {
  const locale = useLocale()
  return (path: string) => localizeHref(path, locale)
}
