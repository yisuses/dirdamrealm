import { describe, expect, it } from 'vitest'

import { navigation } from '@blog/test/navigation'
import { renderHookWithProviders } from '@blog/test/render'

import { localizeHref, useLocalizeHref } from './useLocalizeHref'

describe('localizeHref', () => {
  it('should leave paths untouched for the default locale', () => {
    expect(localizeHref('/post/1/x/', 'es')).toBe('/post/1/x/')
  })

  it('should leave non-root-relative hrefs untouched', () => {
    expect(localizeHref('https://example.com/a/', 'en')).toBe('https://example.com/a/')
  })

  it('should leave paths that already carry the locale untouched', () => {
    expect(localizeHref('/en', 'en')).toBe('/en')
    expect(localizeHref('/en/archive/', 'en')).toBe('/en/archive/')
  })

  it('should prefix paths with a non-default locale', () => {
    expect(localizeHref('/post/1/x/', 'en')).toBe('/en/post/1/x/')
    expect(localizeHref('/english/', 'en')).toBe('/en/english/')
  })
})

describe('useLocalizeHref', () => {
  it('should localize with the current route locale', () => {
    navigation.params = { lng: 'en' }

    const { result } = renderHookWithProviders(() => useLocalizeHref())

    expect(result.current('/archive/')).toBe('/en/archive/')
  })

  it('should not prefix on the default locale', () => {
    const { result } = renderHookWithProviders(() => useLocalizeHref())

    expect(result.current('/archive/')).toBe('/archive/')
  })
})
