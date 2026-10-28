import { useQueryClient } from '@tanstack/react-query'
import { type MockedFunction, beforeEach, describe, expect, it, vi } from 'vitest'

import type { I18nNamespace } from '@blog/core/i18n/i18n-namespaces.type'
import { getAllPosts, getCategories } from '@blog/data'
import { renderWithProviders } from '@blog/test/render'

import Page, { generateMetadata, revalidate } from './page'

vi.mock('@blog/data', () => ({ getCategories: vi.fn(), getAllPosts: vi.fn() }))
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
  const ArchivePage = () => {
    const queries = useQueryClient()
      .getQueryCache()
      .getAll()
      .map(({ queryKey, state }) => ({ queryKey, data: state.data }))
    return <pre data-testid="archive-page">{JSON.stringify(queries)}</pre>
  }
  return { JsonLd, ArchivePage }
})

const mockedGetCategories = getCategories as MockedFunction<typeof getCategories>
const mockedGetAllPosts = getAllPosts as MockedFunction<typeof getAllPosts>

const posts = [{ id: 7, title: 'Hola Mundo' } as Post, { id: 8, title: 'Adiós Mundo' } as Post]
const categories = [{ id: 1, code: 'TRAVEL', localizedName: 'Viajes' } as Category]

const params = (lng: AppLocales) => ({ params: Promise.resolve({ lng }) })

const ldJson = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('script')).map(script => JSON.parse(script.innerHTML))

describe('Archive page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedGetAllPosts.mockResolvedValue(posts)
    mockedGetCategories.mockResolvedValue(categories)
  })

  it('should revalidate once a day as a backstop', () => {
    expect(revalidate).toBe(86400)
  })

  it('should build the metadata', async () => {
    expect(await generateMetadata(params('es'))).toMatchSnapshot()
  })

  it('should prefetch posts and categories and list every post in the JSON-LD', async () => {
    const { container } = renderWithProviders(await Page(params('es')))

    expect(mockedGetAllPosts).toHaveBeenCalledWith({ locale: 'es' })
    expect(mockedGetCategories).toHaveBeenCalledWith({ locale: 'es' })
    expect(container).toMatchSnapshot()
  })

  it('should prefix the urls for other locales', async () => {
    const { container } = renderWithProviders(await Page(params('en')), { lng: 'en' })

    const [page, items] = ldJson(container)
    expect(page.url).toBe('https://example.com/en/archive/')
    expect(items.itemListElement[0].url).toBe('https://example.com/en/post/7/hola-mundo/')
  })

  it('should render an empty list when there are no posts', async () => {
    mockedGetAllPosts.mockResolvedValue(null as unknown as Post[])

    const { container } = renderWithProviders(await Page(params('es')))

    expect(ldJson(container)[1].itemListElement).toEqual([])
  })
})
