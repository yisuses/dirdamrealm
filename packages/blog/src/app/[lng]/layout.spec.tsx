import { type DehydratedState } from '@tanstack/react-query'
import type { ReactElement, ReactNode } from 'react'
import { type MockedFunction, afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { getAbout, getCategories } from '@blog/api'
import { getServerT } from '@blog/core/i18n/server'

import LocaleLayout, { generateStaticParams, viewport } from './layout'

vi.mock('@fontsource/spartan', () => ({}))
vi.mock('next-i18next/server', () => ({
  generateI18nStaticParams: () => [{ lng: 'es' }, { lng: 'en' }],
}))
vi.mock('@blog/api', () => ({ getAbout: vi.fn(), getCategories: vi.fn() }))
vi.mock('@blog/core/i18n/server', () => ({
  getServerT: vi.fn(async () => ({ i18n: { language: 'es' } })),
  getServerResources: () => ({ es: { common: { pageTitle: 'Emoción Blanca' } } }),
}))
vi.mock('@blog/core/query/get-query-client', async () => {
  const { QueryClient } = await import('@tanstack/react-query')
  return { getQueryClient: () => new QueryClient() }
})
// Client-side providers and widgets: stubs keep the tree the layout builds readable.
vi.mock('app-providers', () => ({
  AppProviders: ({ children }: { children: ReactNode }) => <div data-testid="app-providers">{children}</div>,
}))
vi.mock('@vercel/speed-insights/next', () => ({ SpeedInsights: () => null }))
vi.mock('next/script', () => ({
  default: function Script() {
    return null
  },
}))
vi.mock('@blog/components', () => ({
  MainLayout: ({ children }: { children: ReactNode }) => <main>{children}</main>,
}))

const mockedGetAbout = getAbout as MockedFunction<typeof getAbout>
const mockedGetCategories = getCategories as MockedFunction<typeof getCategories>

const categories = [{ id: 1, code: 'TRAVEL', localizedName: 'Viajes' } as Category]
const about = { id: 1, twitter: '@whemotion' } as About

const params = (lng: string) => ({ children: <p>Page</p>, params: Promise.resolve({ lng }) })

type Element = ReactElement<{ children?: ReactNode; state?: DehydratedState }>

const childrenOf = (element: Element) => [element.props.children].flat() as Element[]

describe('Locale layout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Dehydrated queries carry their fetch time.
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-10-21T10:00:00.000Z'))
    mockedGetCategories.mockResolvedValue(categories)
    mockedGetAbout.mockResolvedValue(about)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should lock the viewport scale', () => {
    expect(viewport).toEqual({ width: 'device-width', initialScale: 1, maximumScale: 1, userScalable: false })
  })

  it('should prerender every locale', () => {
    expect(generateStaticParams()).toEqual([{ lng: 'es' }, { lng: 'en' }])
  })

  it('should 404 on a segment that is not a supported locale', async () => {
    await expect(LocaleLayout(params('sitemap_index.xml'))).rejects.toMatchObject({
      digest: expect.stringMatching(/^NEXT_HTTP_ERROR_FALLBACK;404/),
    })
    expect(getServerT).not.toHaveBeenCalled()
  })

  it('should prefetch the header and footer data and render the document', async () => {
    const ui = (await LocaleLayout(params('en'))) as Element

    expect(getServerT).toHaveBeenCalledWith('en')
    expect(mockedGetCategories).toHaveBeenCalledWith({ locale: 'en' })
    expect(mockedGetAbout).toHaveBeenCalled()
    expect(ui).toMatchSnapshot()
  })

  it('should hand the prefetched queries to the client', async () => {
    const ui = (await LocaleLayout(params('es'))) as Element

    const [, body] = childrenOf(ui)
    const [providers] = childrenOf(body)
    const [, hydration] = childrenOf(providers)
    expect(hydration.props.state!.queries.map(({ queryKey, state }) => ({ queryKey, data: state.data }))).toEqual([
      { queryKey: ['categories', 'es'], data: categories },
      { queryKey: ['about'], data: about },
    ])
  })
})
