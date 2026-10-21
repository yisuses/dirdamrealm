import type { i18n as I18nInstance } from 'i18next'
import { getResources, getT, initServerI18next } from 'next-i18next/server'
import { type MockedFunction, beforeEach, describe, expect, it, vi } from 'vitest'

import { LOCALES, NAMESPACES, i18nConfig } from './config'
import { getServerResources, getServerT } from './server'

vi.mock('next-i18next/server', () => ({
  getResources: vi.fn(() => ({ es: {} })),
  getT: vi.fn(async () => ({ t: 'translate' })),
  initServerI18next: vi.fn(),
}))

const mockedInit = initServerI18next as MockedFunction<typeof initServerI18next>
const mockedGetT = getT as MockedFunction<typeof getT>
const mockedGetResources = getResources as MockedFunction<typeof getResources>

type ServerConfig = typeof i18nConfig & {
  resourceLoader: (language: string, namespace: string) => Promise<{ default: Record<string, unknown> }>
}

describe('i18n server', () => {
  // Captured before beforeEach clears the call made at module load.
  const config = mockedInit.mock.calls[0][0] as ServerConfig

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize next-i18next with the shared config on module load', () => {
    expect(config).toMatchObject(i18nConfig)
  })

  it('should load the bundled locale json of every namespace through the resource loader', async () => {
    for (const lng of LOCALES) {
      for (const ns of NAMESPACES) {
        const resource = await config.resourceLoader(lng, ns)

        expect(resource.default).toEqual(expect.any(Object))
      }
    }
  })

  it('should reject when there is no locale json for the namespace', async () => {
    await expect(config.resourceLoader('en', 'missing')).rejects.toThrow()
  })

  it('should init and return the translation function for the given locale', async () => {
    await expect(getServerT('en', 'homePage')).resolves.toEqual({ t: 'translate' })

    expect(mockedInit).toHaveBeenCalledTimes(1)
    expect(mockedGetT).toHaveBeenCalledWith('homePage', { lng: 'en' })
  })

  it('should return the resources of the given namespaces', () => {
    const i18n = {} as I18nInstance

    expect(getServerResources(i18n, ['common'])).toEqual({ es: {} })
    expect(mockedGetResources).toHaveBeenCalledWith(i18n, ['common'])
  })
})
