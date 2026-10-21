import { describe, expect, it } from 'vitest'

import { navigation } from '@blog/test/navigation'
import { renderHookWithProviders } from '@blog/test/render'

import { useGetLocalePublicUrl } from './useGetLocalePublicUrl'

describe('useGetLocalePublicUrl', () => {
  it('should build an unprefixed public url for the default locale', () => {
    const { result } = renderHookWithProviders(() => useGetLocalePublicUrl())

    expect(result.current('/archive/')).toBe('https://example.com/archive/')
  })

  it('should prefix the public url with a non-default locale', () => {
    navigation.params = { lng: 'en' }

    const { result } = renderHookWithProviders(() => useGetLocalePublicUrl())

    expect(result.current('/archive/')).toBe('https://example.com/en/archive/')
  })
})
