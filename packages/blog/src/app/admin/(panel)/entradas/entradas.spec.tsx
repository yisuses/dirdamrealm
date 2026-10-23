import { beforeEach, describe, expect, it, vi } from 'vitest'

import { PostList } from '@blog/components/admin/posts/PostList'
import { PostEditor } from '@blog/components/admin/posts/editor/PostEditor'
import { getPostForEditor, listEditorOptions, listPostsForAdmin } from '@blog/db/queries/admin/posts'

import EditPostPage from './[postId]/[locale]/page'
import PostRedirectPage from './[postId]/page'
import PostsPage from './page'

vi.mock('@blog/db/queries/admin/posts', () => ({
  listPostsForAdmin: vi.fn(async () => ({ posts: ['post'], total: 1 })),
  listEditorOptions: vi.fn(async () => ({ writers: ['writer'], categories: ['category'] })),
  getPostForEditor: vi.fn(),
}))

const postId = '11111111-1111-4111-8111-111111111111'
const categoryId = '22222222-2222-4222-8222-222222222222'
const notFound = expect.objectContaining({ digest: expect.stringContaining('NEXT_HTTP_ERROR_FALLBACK;404') })
const redirectTo = (path: string) => expect.objectContaining({ digest: expect.stringContaining(`;${path};`) })
const translation = { status: 'draft' }

describe('posts list page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should list with the filters in the address', async () => {
    const page = await PostsPage({
      searchParams: Promise.resolve({
        q: '  Lisboa  ',
        idioma: 'en',
        estado: 'scheduled',
        categoria: categoryId,
        pagina: '3',
      }),
    })

    const filters = { query: 'Lisboa', locale: 'en', status: 'scheduled', categoryId, page: 3 }
    expect(listPostsForAdmin).toHaveBeenCalledWith(filters)
    expect(page.type).toBe(PostList)
    expect(page.props).toEqual({ posts: ['post'], total: 1, filters, categories: ['category'] })
  })

  it('should ignore filters that are not valid values', async () => {
    await PostsPage({
      searchParams: Promise.resolve({
        q: ['a', 'b'],
        idioma: 'fr',
        estado: 'archived',
        categoria: 'nope',
        pagina: 'x',
      }),
    })
    expect(listPostsForAdmin).toHaveBeenLastCalledWith({
      query: undefined,
      locale: undefined,
      status: undefined,
      categoryId: undefined,
      page: 1,
    })

    await PostsPage({ searchParams: Promise.resolve({ idioma: 'es', pagina: '5000', q: 'x'.repeat(150) }) })
    expect(listPostsForAdmin).toHaveBeenLastCalledWith(
      expect.objectContaining({ locale: 'es', page: 1000, query: 'x'.repeat(100) }),
    )
    await PostsPage({ searchParams: Promise.resolve({ pagina: '-2' }) })
    expect(listPostsForAdmin).toHaveBeenLastCalledWith(expect.objectContaining({ page: 1 }))
  })
})

describe('post pages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should open a post in Spanish, or in English when that is all it has', async () => {
    vi.mocked(getPostForEditor).mockResolvedValueOnce({ translations: { es: translation, en: translation } } as never)
    await expect(PostRedirectPage({ params: Promise.resolve({ postId }) })).rejects.toMatchObject(
      redirectTo(`/admin/entradas/${postId}/es/`),
    )

    vi.mocked(getPostForEditor).mockResolvedValueOnce({ translations: { en: translation } } as never)
    await expect(PostRedirectPage({ params: Promise.resolve({ postId }) })).rejects.toMatchObject(
      redirectTo(`/admin/entradas/${postId}/en/`),
    )

    await expect(PostRedirectPage({ params: Promise.resolve({ postId }) })).rejects.toMatchObject(notFound)
    await expect(PostRedirectPage({ params: Promise.resolve({ postId: 'nope' }) })).rejects.toMatchObject(notFound)
  })

  it('should edit a language, keyed by language and action version', async () => {
    const post = { id: postId, translations: { es: translation } }
    vi.mocked(getPostForEditor).mockResolvedValue(post as never)

    const page = await EditPostPage({
      params: Promise.resolve({ postId, locale: 'es' }),
      searchParams: Promise.resolve({ v: '123' }),
    })

    expect(page.type).toBe(PostEditor)
    expect(page.key).toBe('es:123')
    expect(page.props).toEqual({ post, locale: 'es', writers: ['writer'], categories: ['category'] })
    const fresh = await EditPostPage({
      params: Promise.resolve({ postId, locale: 'es' }),
      searchParams: Promise.resolve({}),
    })
    expect(fresh.key).toBe('es:')
  })

  it('should 404 for missing languages, posts or malformed addresses', async () => {
    vi.mocked(getPostForEditor).mockResolvedValue({ id: postId, translations: { es: translation } } as never)
    const page = (id: string, locale: string) =>
      EditPostPage({ params: Promise.resolve({ postId: id, locale }), searchParams: Promise.resolve({}) })

    await expect(page(postId, 'en')).rejects.toMatchObject(notFound)
    await expect(page(postId, 'fr')).rejects.toMatchObject(notFound)
    await expect(page('nope', 'es')).rejects.toMatchObject(notFound)
    vi.mocked(getPostForEditor).mockResolvedValue(undefined)
    await expect(page(postId, 'es')).rejects.toMatchObject(notFound)
    expect(listEditorOptions).not.toHaveBeenCalled()
  })
})
