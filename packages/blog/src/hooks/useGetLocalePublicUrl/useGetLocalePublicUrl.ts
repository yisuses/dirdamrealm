'use client'

import { DEFAULT_LOCALE } from '@blog/core/i18n/config'
import { useLocale } from '@blog/hooks/useLocale'
import { publicUrl } from '@blog/utils/generateUrl/generateUrl'

export function useGetLocalePublicUrl() {
  const locale = useLocale()
  const localePrefix = locale === DEFAULT_LOCALE ? '' : `/${locale}`
  return (path: string) => publicUrl(`${localePrefix}${path}`)
}
