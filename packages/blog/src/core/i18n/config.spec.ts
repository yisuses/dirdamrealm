import { describe, expect, it } from 'vitest'

import { DEFAULT_LOCALE, LOCALES, NAMESPACES, i18nConfig, isAppLocale } from './config'

describe('i18n config', () => {
  it('should accept the supported locales', () => {
    expect(isAppLocale('es')).toBe(true)
    expect(isAppLocale('en')).toBe(true)
  })

  it('should reject anything else', () => {
    expect(isAppLocale(undefined)).toBe(false)
    expect(isAppLocale('')).toBe(false)
    expect(isAppLocale('sitemap_index.xml')).toBe(false)
  })

  it('should build the next-i18next config from the shared constants', () => {
    expect(i18nConfig).toMatchObject({
      supportedLngs: [...LOCALES],
      fallbackLng: DEFAULT_LOCALE,
      defaultNS: 'common',
      ns: [...NAMESPACES],
      localeInPath: true,
      hideDefaultLocale: true,
    })
  })
})
