'use client'

import { usePathname, useRouter } from 'next/navigation'

import { DEFAULT_LOCALE, LOCALES } from '@blog/core/i18n/config'

/**
 * Switches the app locale by navigating to the equivalent path under the target locale
 * prefix (default locale has no prefix). Mirrors the previous `router.push(asPath, { locale })`.
 */
export function useSwitchLocale() {
  const router = useRouter()
  const pathname = usePathname() || '/'

  return (nextLng: AppLocales) => {
    // Strip any existing non-default locale prefix to get the bare path.
    let bare = pathname
    for (const l of LOCALES.filter(loc => loc !== DEFAULT_LOCALE)) {
      if (bare === `/${l}` || bare.startsWith(`/${l}/`)) {
        bare = bare.slice(l.length + 1) || '/'
        break
      }
    }

    const target = nextLng === DEFAULT_LOCALE ? bare : `/${nextLng}${bare}`
    document.cookie = `i18next=${nextLng};path=/;max-age=${365 * 24 * 60 * 60};SameSite=Lax`
    router.push(target)
  }
}
