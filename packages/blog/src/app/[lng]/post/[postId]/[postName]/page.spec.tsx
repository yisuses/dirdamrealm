import * as sentry from '@sentry/nextjs'
import { useQueryClient } from '@tanstack/react-query'
import { type MockedFunction, beforeEach, describe, expect, it, vi } from 'vitest'

import { getAbout, getComments, getLatestPosts, getPostById } from '@blog/api'
import { getAllPosts } from '@blog/api/post'
import type { I18nNamespace } from '@blog/core/i18n/i18n-namespaces.type'
import { renderWithProviders } from '@blog/test/render'

import Page, { generateMetadata, generateStaticParams, revalidate } from './page'

vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }))
vi.mock('@blog/api', () => ({
  getAbout: vi.fn(),
  getComments: vi.fn(),
  getLatestPosts: vi.fn(),
  getPostById: vi.fn(),
}))
vi.mock('@blog/api/post', () => ({ getAllPosts: vi.fn() }))
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
  const PostPage = () => {
    const queries = useQueryClient()
      .getQueryCache()
      .getAll()
      .map(({ queryKey, state }) => ({ queryKey, data: state.data }))
    return <pre data-testid="post-page">{JSON.stringify(queries)}</pre>
  }
  return { JsonLd, PostPage }
})

const mockedGetAbout = getAbout as MockedFunction<typeof getAbout>
const mockedGetComments = getComments as MockedFunction<typeof getComments>
const mockedGetLatestPosts = getLatestPosts as MockedFunction<typeof getLatestPosts>
const mockedGetPostById = getPostById as MockedFunction<typeof getPostById>
const mockedGetAllPosts = getAllPosts as MockedFunction<typeof getAllPosts>

const format = (name: string, width: number, height: number) => ({ url: `/media/${name}.jpg`, width, height })

const coverImage = {
  caption: 'Un atardecer',
  url: '/media/original.jpg',
  formats: { small: format('small', 500, 250), medium: format('medium', 750, 375) },
} as unknown as Media

const post: Post = {
  id: 7,
  title: 'Hola Mundo',
  summary: 'Un resumen',
  imgUrl: 'https://example.com/fallback.png',
  publishedAt: '2026-10-20T11:30:00.000Z',
  createdAt: '2026-10-19T09:00:00.000Z',
  updatedAt: '2026-10-21T08:00:00.000Z',
  categories: [{ id: 1, code: 'TRAVEL', localizedName: 'Viajes' } as Category],
  content: {
    time: 1,
    version: '',
    blocks: [
      { type: 'paragraph', data: { text: 'Primer <b>párrafo</b>' } },
      { type: 'header', data: { text: 'Título' } },
    ],
  },
  coverImage,
  coverImageAuthor: null,
  coverImageSourceUrl: null,
  localizations: [{ id: 8, locale: 'en', title: 'Hello World' } as Post],
  locale: 'es',
  writer: { name: 'Saúl', twitter: '@saul', personalUrl: 'https://saul.dev' } as Writer,
}

const englishPost = { ...post, id: 8, title: 'Hello World', locale: 'en', localizations: [] } as Post

// The bare minimum Strapi can send back: every optional field missing.
const barePost: Post = {
  ...post,
  updatedAt: undefined,
  categories: null,
  coverImage: null,
  localizations: null,
  writer: null,
}

const params = (lng: AppLocales, postId = '7', postName = 'hola-mundo') => ({
  params: Promise.resolve({ lng, postId, postName }),
})

const notFound = { digest: expect.stringMatching(/^NEXT_HTTP_ERROR_FALLBACK;404/) }
const redirectTo = (url: string) => ({ digest: expect.stringContaining(`NEXT_REDIRECT;replace;${url};`) })

const ldJson = (container: HTMLElement) => JSON.parse(container.querySelector('script')!.innerHTML)

describe('Post page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedGetPostById.mockImplementation(async ({ id }) => (id === 8 ? englishPost : post))
    mockedGetAbout.mockResolvedValue({ twitter: '@whemotion' } as About)
    mockedGetComments.mockResolvedValue([])
    mockedGetLatestPosts.mockResolvedValue([englishPost])
  })

  it('should revalidate once a day as a backstop', () => {
    expect(revalidate).toBe(86400)
  })

  describe('generateStaticParams', () => {
    it('should list every well-formed post of every locale', async () => {
      mockedGetAllPosts.mockImplementation(async ({ locale }) =>
        locale === 'es'
          ? [
              post,
              null as unknown as Post,
              { ...post, title: 42 as unknown as string },
              { ...post, title: '' },
              { ...post, id: null as unknown as number },
            ]
          : [englishPost],
      )

      expect(await generateStaticParams()).toEqual([
        { lng: 'es', postId: '7', postName: 'hola-mundo' },
        { lng: 'en', postId: '8', postName: 'hello-world' },
      ])
    })

    it('should skip a locale whose posts fail to load or come back empty', async () => {
      mockedGetAllPosts.mockImplementation(async ({ locale }) => {
        if (locale === 'es') throw new Error('Strapi down')
        return null as unknown as Post[]
      })

      expect(await generateStaticParams()).toEqual([])
    })
  })

  describe('generateMetadata', () => {
    it('should build the article metadata', async () => {
      expect(await generateMetadata(params('es'))).toMatchSnapshot()
      expect(mockedGetPostById).toHaveBeenCalledWith({ id: 7 })
    })

    it('should leave the optional article fields out when the post lacks them', async () => {
      mockedGetPostById.mockResolvedValue(barePost)
      mockedGetAbout.mockRejectedValue(new Error('Strapi down'))

      const metadata = await generateMetadata(params('es'))

      expect(metadata.openGraph).toMatchObject({
        modifiedTime: undefined,
        section: undefined,
        authors: undefined,
        images: ['https://example.com/fallback.png'],
      })
      expect(metadata.twitter).toMatchObject({ images: ['https://example.com/fallback.png'], creator: undefined })
    })

    it('should fall back to the site twitter account and skip an unnamed category', async () => {
      mockedGetPostById.mockResolvedValue({
        ...post,
        categories: [{ ...post.categories![0], localizedName: '' }],
        writer: { name: '' } as Writer,
      })

      const metadata = await generateMetadata(params('es'))

      expect(metadata.openGraph).toMatchObject({ section: undefined, authors: undefined })
      expect(metadata.twitter).toMatchObject({ creator: '@whemotion' })
    })

    it('should skip the section when the post has no categories', async () => {
      mockedGetPostById.mockResolvedValue({ ...post, categories: [] })

      expect((await generateMetadata(params('es'))).openGraph).toMatchObject({ section: undefined })
    })

    it('should return nothing for a non-numeric post id', async () => {
      expect(await generateMetadata(params('es', 'abc'))).toEqual({})
      expect(mockedGetPostById).not.toHaveBeenCalled()
    })

    it('should report a failed fetch and return nothing', async () => {
      const error = new Error('Strapi down')
      mockedGetPostById.mockRejectedValue(error)

      expect(await generateMetadata(params('es'))).toEqual({})
      expect(sentry.captureException).toHaveBeenCalledWith(error)
    })
  })

  describe('Page', () => {
    it('should 404 on a non-numeric post id', async () => {
      await expect(Page(params('es', 'abc'))).rejects.toMatchObject(notFound)
    })

    it('should 404 when the post cannot be loaded', async () => {
      mockedGetPostById.mockRejectedValue(new Error('Strapi down'))

      await expect(Page(params('es'))).rejects.toMatchObject(notFound)
    })

    it('should 404 on an unpublished post', async () => {
      mockedGetPostById.mockResolvedValue({ ...post, publishedAt: '' })

      await expect(Page(params('es'))).rejects.toMatchObject(notFound)
    })

    it('should redirect to the localized entry when landing on another locale', async () => {
      await expect(Page(params('en'))).rejects.toMatchObject(redirectTo('/en/post/8/hello-world/'))
      expect(mockedGetPostById).toHaveBeenLastCalledWith({ id: 8 })
    })

    it('should redirect to the default locale without a prefix', async () => {
      mockedGetPostById.mockImplementation(async ({ id }) =>
        id === 8 ? { ...englishPost, localizations: [{ id: 7, locale: 'es' } as Post] } : post,
      )

      await expect(Page(params('es', '8', 'hello-world'))).rejects.toMatchObject(redirectTo('/post/7/hola-mundo/'))
    })

    it('should keep the entry when its localized version fails to load', async () => {
      mockedGetPostById.mockImplementation(async ({ id }) => {
        if (id === 8) throw new Error('Strapi down')
        return post
      })

      const { container } = renderWithProviders(await Page(params('en')), { lng: 'en' })

      expect(ldJson(container).mainEntityOfPage).toBe('https://example.com/en/post/7/hola-mundo/')
    })

    it('should keep the entry when it has no localization for the locale', async () => {
      mockedGetPostById.mockResolvedValue(barePost)

      const { container } = renderWithProviders(await Page(params('en')), { lng: 'en' })

      expect(ldJson(container).inLanguage).toBe('es')
    })

    it('should redirect a stale slug to the canonical url of the default locale', async () => {
      await expect(Page(params('es', '7', 'hola'))).rejects.toMatchObject(redirectTo('/post/7/hola-mundo/'))
    })

    it('should redirect a stale slug to the canonical url of a prefixed locale', async () => {
      await expect(Page(params('en', '8', 'hello'))).rejects.toMatchObject(redirectTo('/en/post/8/hello-world/'))
    })

    it('should prefetch comments and related posts and render the page with its JSON-LD', async () => {
      const { container } = renderWithProviders(await Page(params('es')))

      expect(mockedGetComments).toHaveBeenCalledWith({ ids: [8, 7] })
      expect(mockedGetLatestPosts).toHaveBeenCalledWith({ locale: 'es', category: 'TRAVEL', limit: 8 })
      expect(container).toMatchSnapshot()
    })

    it('should render the JSON-LD of a post without optional fields', async () => {
      mockedGetPostById.mockResolvedValue(barePost)

      const { container } = renderWithProviders(await Page(params('es')))

      expect(mockedGetComments).toHaveBeenCalledWith({ ids: [7] })
      expect(mockedGetLatestPosts).not.toHaveBeenCalled()
      const ld = ldJson(container)
      expect(ld).not.toHaveProperty('image')
      expect(ld).toMatchObject({
        author: { '@type': 'Person', url: '' },
        creator: { '@type': 'Person', url: '' },
        articleSection: '',
      })
      expect(ld.author).not.toHaveProperty('name')
    })

    it('should leave the image size empty when the cover has no medium format', async () => {
      mockedGetPostById.mockResolvedValue({
        ...post,
        categories: [],
        coverImage: { ...coverImage, formats: { small: format('small', 500, 250) } } as unknown as Media,
        writer: { name: 'Saúl' } as Writer,
      })

      const { container } = renderWithProviders(await Page(params('es')))

      const ld = ldJson(container)
      expect(ld.image).toEqual({ '@type': 'ImageObject', url: '/media/small.jpg', width: '', height: '' })
      expect(ld.author).toEqual({ '@type': 'Person', name: 'Saúl', url: '' })
      expect(ld.articleSection).toBe('')
      expect(mockedGetLatestPosts).not.toHaveBeenCalled()
    })
  })
})
