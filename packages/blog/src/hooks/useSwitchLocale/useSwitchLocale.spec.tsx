import { afterEach, describe, expect, it } from 'vitest'

import { navigation } from '@blog/test/navigation'
import { renderHookWithProviders } from '@blog/test/render'

import { useSwitchLocale } from './useSwitchLocale'

function switchTo(pathname: string | null, lng: AppLocales) {
  navigation.pathname = pathname as string
  const { result } = renderHookWithProviders(() => useSwitchLocale())
  result.current(lng)
}

describe('useSwitchLocale', () => {
  afterEach(() => {
    document.cookie = 'i18next=;path=/;max-age=0'
  })

  it('should prefix the path when switching to a non-default locale', () => {
    switchTo('/archive/', 'en')

    expect(navigation.router.push).toHaveBeenCalledWith('/en/archive/')
  })

  it('should strip the locale prefix when switching to the default locale', () => {
    switchTo('/en/archive/', 'es')

    expect(navigation.router.push).toHaveBeenCalledWith('/archive/')
  })

  it('should go to the root when leaving the bare locale home', () => {
    switchTo('/en', 'es')

    expect(navigation.router.push).toHaveBeenCalledWith('/')
  })

  it('should not treat paths that only start with the locale letters as prefixed', () => {
    switchTo('/english/', 'es')

    expect(navigation.router.push).toHaveBeenCalledWith('/english/')
  })

  it('should replace an existing prefix rather than stacking it', () => {
    switchTo('/en/post/1/x/', 'en')

    expect(navigation.router.push).toHaveBeenCalledWith('/en/post/1/x/')
  })

  it('should fall back to the root when there is no pathname', () => {
    switchTo(null, 'en')

    expect(navigation.router.push).toHaveBeenCalledWith('/en/')
  })

  it('should persist the chosen locale in the i18next cookie', () => {
    switchTo('/archive/', 'en')

    expect(document.cookie).toContain('i18next=en')
  })
})
