import { describe, expect, it } from 'vitest'

import { navigation } from '@blog/test/navigation'
import { renderHookWithProviders } from '@blog/test/render'

import { useLocale } from './useLocale'

describe('useLocale', () => {
  it('should return the locale from the route segment', () => {
    navigation.params = { lng: 'en' }

    expect(renderHookWithProviders(() => useLocale()).result.current).toBe('en')
  })

  it('should take the first value of an array segment', () => {
    navigation.params = { lng: ['en', 'x'] }

    expect(renderHookWithProviders(() => useLocale()).result.current).toBe('en')
  })

  it('should fall back to the default locale for anything else', () => {
    navigation.params = { lng: 'sitemap_index.xml' }

    expect(renderHookWithProviders(() => useLocale()).result.current).toBe('es')
  })
})
