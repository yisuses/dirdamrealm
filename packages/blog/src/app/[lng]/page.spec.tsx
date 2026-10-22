import { useQueryClient } from '@tanstack/react-query'
import { type MockedFunction, beforeEach, describe, expect, it, vi } from 'vitest'

import type { I18nNamespace } from '@blog/core/i18n/i18n-namespaces.type'
import { getLatestPosts } from '@blog/data'
import { renderWithProviders } from '@blog/test/render'

import Page, { generateMetadata, revalidate } from './page'

vi.mock('@blog/data', () => ({ getLatestPosts: vi.fn() }))
// next-i18next/server pulls in next/headers, which only resolves inside Next; the real
// locale JSON still backs the translations.
vi.mock('@blog/core/i18n/server', async () => {
  const { createTestI18n } = await import('@blog/test/render')
  return {
    getServerT: async (lng: AppLocales, ns: I18nNamespace) => ({ t: createTestI18n(lng).getFixedT(lng, ns) }),
  }
})
vi.mock('@blog/core/query/get-query-client', async () => {
  const { QueryClient } = await import('@tanstack/react-query')
  return { getQueryClient: () => new QueryClient() }
})
vi.mock('@blog/components', async () => {
  const { JsonLd } = await import('@blog/components/common/JsonLd/JsonLd')
  // The real page is client-side; the stub prints the cache it receives from the server.
  const HomePage = () => {
    const queries = useQueryClient()
      .getQueryCache()
      .getAll()
      .map(({ queryKey, state }) => ({ queryKey, data: state.data }))
    return <pre data-testid="home-page">{JSON.stringify(queries)}</pre>
  }
  return { JsonLd, HomePage }
})

const mockedGetLatestPosts = getLatestPosts as MockedFunction<typeof getLatestPosts>

const post = { id: 7, title: 'Hola Mundo' } as Post

const params = (lng: AppLocales) => ({ params: Promise.resolve({ lng }) })

describe('Home page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedGetLatestPosts.mockResolvedValue([post])
  })

  it('should revalidate once a day as a backstop', () => {
    expect(revalidate).toBe(86400)
  })

  it('should build the metadata for the default locale', async () => {
    expect(await generateMetadata(params('es'))).toMatchSnapshot()
  })

  it('should build the metadata for a prefixed locale', async () => {
    const metadata = await generateMetadata(params('en'))

    expect(metadata.openGraph?.url).toBe('https://example.com/en/')
  })

  it('should prefetch the latest posts and render the page with its JSON-LD', async () => {
    const { container } = renderWithProviders(await Page(params('es')))

    expect(mockedGetLatestPosts).toHaveBeenCalledWith({ locale: 'es', limit: 18 })
    expect(container).toMatchSnapshot()
  })

  it('should point the JSON-LD at the prefixed url for other locales', async () => {
    const { container } = renderWithProviders(await Page(params('en')), { lng: 'en' })

    const ldJson = JSON.parse(container.querySelector('script')!.innerHTML)
    expect(ldJson.url).toBe('https://example.com/en/')
    expect(mockedGetLatestPosts).toHaveBeenCalledWith({ locale: 'en', limit: 18 })
  })
})
