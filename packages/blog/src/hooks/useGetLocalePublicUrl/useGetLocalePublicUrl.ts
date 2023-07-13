import { useRouter } from 'next/router'

import { publicUrl } from '@blog/utils/generateUrl/generateUrl'

export function useGetLocalePublicUrl() {
  const { locale, defaultLocale } = useRouter()
  const localePrefix = locale === defaultLocale ? '' : `/${locale}`
  return (path: string) => publicUrl(`${localePrefix}${path}`)
}
