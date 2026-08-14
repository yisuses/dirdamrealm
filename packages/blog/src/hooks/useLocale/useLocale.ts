'use client'

import { useParams } from 'next/navigation'

import { DEFAULT_LOCALE, isAppLocale } from '@blog/core/i18n/config'

/**
 * Current locale from the `[lng]` route segment. The proxy rewrite populates it ('es' for the
 * hidden default, 'en' otherwise), but paths with a dot skip the proxy and put arbitrary text
 * in the segment, so unsupported values fall back to the default locale instead of leaking into
 * `Intl` consumers (which throw on invalid locales).
 */
export function useLocale(): AppLocales {
  const params = useParams<{ lng?: string }>()
  const lng = Array.isArray(params?.lng) ? params.lng[0] : params?.lng
  return isAppLocale(lng) ? lng : DEFAULT_LOCALE
}
