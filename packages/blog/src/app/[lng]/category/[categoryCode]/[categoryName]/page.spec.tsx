import { useQueryClient } from '@tanstack/react-query'
import { type MockedFunction, beforeEach, describe, expect, it, vi } from 'vitest'

import { getCategories, getLatestPosts } from '@blog/api'
import type { I18nNamespace } from '@blog/core/i18n/i18n-namespaces.type'
import { renderWithProviders } from '@blog/test/render'

import Page, { generateMetadata, generateStaticParams, revalidate } from './page'

vi.mock('@blog/api', () => ({ getCategories: vi.fn(), getLatestPosts: vi.fn() }))
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
  const CategoryPage = () => {
    const queries = useQueryClient()
      .getQueryCache()
      .getAll()
      .map(({ queryKey, state }) => ({ queryKey, data: state.data }))
    return <pre data-testid="category-page">{JSON.stringify(queries)}</pre>
  }
  return { JsonLd, CategoryPage }
})

const mockedGetCategories = getCategories as MockedFunction<typeof getCategories>
const mockedGetLatestPosts = getLatestPosts as MockedFunction<typeof getLatestPosts>

const category = { id: 1, code: 'TRAVEL', name: 'Travel', localizedName: 'Viajes y más' } as Category
const posts = [{ id: 7, title: 'Hola Mundo' } as Post]

const params = (lng: AppLocales, categoryCode = 'TRAVEL', categoryName = 'viajes-y-mas') => ({
  params: Promise.resolve({ lng, categoryCode, categoryName }),
})

const notFound = { digest: expect.stringMatching(/^NEXT_HTTP_ERROR_FALLBACK;404/) }
const redirectTo = (url: string) => ({ digest: expect.stringContaining(`NEXT_REDIRECT;replace;${url};`) })

const ldJson = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('script')).map(script => JSON.parse(script.innerHTML))

describe('Category page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedGetCategories.mockResolvedValue([category])
    mockedGetLatestPosts.mockResolvedValue(posts)
  })

  it('should revalidate once a day as a backstop', () => {
    expect(revalidate).toBe(86400)
  })

  describe('generateStaticParams', () => {
    it('should list every well-formed category of every locale', async () => {
      mockedGetCategories.mockImplementation(async ({ locale }) =>
        locale === 'es'
          ? [
              category,
              null as unknown as Category,
              { ...category, localizedName: 42 as unknown as string },
              { ...category, localizedName: '' },
              { ...category, code: '' },
            ]
          : [{ ...category, localizedName: 'Travel & more' }],
      )

      expect(await generateStaticParams()).toEqual([
        { lng: 'es', categoryCode: 'TRAVEL', categoryName: 'viajes-y-mas' },
        { lng: 'en', categoryCode: 'TRAVEL', categoryName: 'travel-and-more' },
      ])
    })

    it('should skip a locale whose categories fail to load', async () => {
      mockedGetCategories.mockImplementation(async ({ locale }) => {
        if (locale === 'es') throw new Error('Strapi down')
        return [category]
      })

      expect(await generateStaticParams()).toEqual([
        { lng: 'en', categoryCode: 'TRAVEL', categoryName: 'viajes-y-mas' },
      ])
    })
  })

  describe('generateMetadata', () => {
    it('should build the metadata of the category', async () => {
      expect(await generateMetadata(params('es'))).toMatchSnapshot()
      expect(mockedGetCategories).toHaveBeenCalledWith({ locale: 'es', code: 'TRAVEL' })
    })

    it('should return nothing for a malformed category code', async () => {
      expect(await generateMetadata(params('es', 'travel'))).toEqual({})
      expect(mockedGetCategories).not.toHaveBeenCalled()
    })

    it('should return nothing when the category is not found', async () => {
      mockedGetCategories.mockResolvedValue([])

      expect(await generateMetadata(params('es'))).toEqual({})
    })

    it('should return nothing when the categories fail to load', async () => {
      mockedGetCategories.mockRejectedValue(new Error('Strapi down'))

      expect(await generateMetadata(params('es'))).toEqual({})
    })
  })

  describe('Page', () => {
    it('should 404 on a malformed category code', async () => {
      await expect(Page(params('es', 'travel'))).rejects.toMatchObject(notFound)
    })

    it('should 404 when the code does not match exactly one category', async () => {
      mockedGetCategories.mockResolvedValue([category, category])

      await expect(Page(params('es'))).rejects.toMatchObject(notFound)
    })

    it('should redirect a stale slug to the canonical url of the default locale', async () => {
      await expect(Page(params('es', 'TRAVEL', 'viajes'))).rejects.toMatchObject(
        redirectTo('/category/TRAVEL/viajes-y-mas/'),
      )
    })

    it('should redirect a stale slug to the canonical url of a prefixed locale', async () => {
      await expect(Page(params('en', 'TRAVEL', 'viajes'))).rejects.toMatchObject(
        redirectTo('/en/category/TRAVEL/viajes-y-mas/'),
      )
    })

    it('should prefetch the category and its latest posts and render the page with its JSON-LD', async () => {
      const { container } = renderWithProviders(await Page(params('es')))

      expect(mockedGetLatestPosts).toHaveBeenCalledWith({ locale: 'es', category: 'TRAVEL' })
      expect(container).toMatchSnapshot()
    })

    it('should prefix the urls for other locales, matching the canonical category url', async () => {
      const { container } = renderWithProviders(await Page(params('en')), { lng: 'en' })

      const [page, items] = ldJson(container)
      // Built from the localized name, like the canonical url the page redirects to.
      expect(page.url).toBe('https://example.com/en/category/TRAVEL/viajes-y-mas/')
      expect(items.itemListElement[0].url).toBe('https://example.com/en/post/7/hola-mundo/')
    })

    it('should render an empty list when the category has no posts', async () => {
      mockedGetLatestPosts.mockResolvedValue(null as unknown as Post[])

      const { container } = renderWithProviders(await Page(params('es')))

      expect(ldJson(container)[1].itemListElement).toEqual([])
    })
  })
})
