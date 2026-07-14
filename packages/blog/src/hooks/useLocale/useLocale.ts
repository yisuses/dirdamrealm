'use client'

import { useParams } from 'next/navigation'

import { DEFAULT_LOCALE } from '@blog/core/i18n/config'

/**
 * Current locale from the `[lng]` route segment. Thanks to the proxy rewrite the segment
 * is always populated ('es' for the hidden default, 'en' otherwise).
 */
export function useLocale(): AppLocales {
  const params = useParams<{ lng?: string }>()
  const lng = Array.isArray(params?.lng) ? params.lng[0] : params?.lng
  return (lng as AppLocales) || (DEFAULT_LOCALE as AppLocales)
}
