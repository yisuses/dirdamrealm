import { eq } from 'drizzle-orm'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { categories, categoryTranslations, postCategories, postTranslations, posts, writers } from '@blog/db/schema'
import { type TestDb, createTestDb } from '@blog/test/db'

import {
  getAllPostsFromDb,
  getLatestPostsFromDb,
  getPostByIdFromDb,
  getPreviewPostFromDb,
  searchPostsFromDb,
} from './posts'

const testDb = vi.hoisted(() => ({ current: undefined as unknown as TestDb }))
vi.mock('@blog/db/client', () => ({ getDb: () => testDb.current.db }))

const content = (text: string) => ({ time: 1, version: '2.28.2', blocks: [{ type: 'paragraph', data: { text } }] })
const at = (day: string) => new Date(`2026-${day}T10:00:00.000Z`)
const ids = (list: Post[]) => list.map(post => post.id)

/**
 * Post A: es 100 + en 101, cover, writer, categories MAC then TRA.
 * Post B: es 200 only, no cover or writer, TRA.
 * Post C: es 300, draft. Post D: es 400, published but deleted.
 */
async function seed() {
  const { db } = testDb.current
  const [writer] = await db.insert(writers).values({ name: 'José Madrid', twitter: '@jose' }).returning()
  const [travel, music] = await db
    .insert(categories)
    .values([
      { code: 'TRA', main: true, createdAt: at('01-01'), updatedAt: at('01-01') },
      { code: 'MAC', main: true, createdAt: at('01-02'), updatedAt: at('01-02') },
    ])
    .returning()
  await db.insert(categoryTranslations).values([
    { categoryId: travel!.id, locale: 'es', name: 'Viajes' },
    { categoryId: travel!.id, locale: 'en', name: 'Travel' },
    { categoryId: music!.id, locale: 'es', name: 'Música y cine' },
    { categoryId: music!.id, locale: 'en', name: 'Music and cinema' },
  ])
  const [a, b, c, d] = await db
    .insert(posts)
    .values([
      {
        writerId: writer!.id,
        cover: { publicId: 'cover-a', width: 1200, height: 800, alt: 'Portada' },
        coverImageAuthor: 'Autora',
        coverImageSourceUrl: 'https://unsplash.com/a',
      },
      { imgUrl: 'https://example.com/b.jpg' },
      {},
      { deletedAt: at('05-01') },
    ])
    .returning()
  const translation = (
    postId: string,
    locale: 'es' | 'en',
    number: number,
    title: string,
    published: string | null,
    updated: string,
  ) => ({
    postId,
    locale,
    number,
    title,
    summary: `Resumen de ${title}`,
    content: content(title),
    status: published ? ('published' as const) : ('draft' as const),
    publishedAt: published ? at(published) : null,
    createdAt: at('01-01'),
    updatedAt: at(updated),
  })
  await db
    .insert(postTranslations)
    .values([
      translation(a!.id, 'es', 100, 'Música en Madrid', '03-01', '03-05'),
      translation(a!.id, 'en', 101, 'Music in Madrid', '03-02', '03-03'),
      translation(b!.id, 'es', 200, 'Viaje a 100% Lisboa', '04-01', '04-01'),
      translation(c!.id, 'es', 300, 'Borrador sobre música', null, '04-02'),
      translation(d!.id, 'es', 400, 'Borrada de música', '04-03', '04-03'),
    ])
  await db.insert(postCategories).values([
    { postId: a!.id, categoryId: music!.id, position: 0 },
    { postId: a!.id, categoryId: travel!.id, position: 1 },
    { postId: b!.id, categoryId: travel!.id, position: 0 },
  ])
}

describe('post queries', () => {
  beforeAll(async () => {
    vi.stubEnv('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME', 'demo')
    testDb.current = await createTestDb()
    await seed()
  })

  afterAll(async () => {
    vi.unstubAllEnvs()
    await testDb.current.client.close()
  })

  describe('getLatestPostsFromDb', () => {
    it('should list published, non-deleted posts of every locale, newest first, with the default relations', async () => {
      const result = await getLatestPostsFromDb({})

      expect(ids(result)).toEqual([200, 101, 100])
      const spanish = result.find(post => post.id === 100)!
      expect(spanish).toMatchObject({
        title: 'Música en Madrid',
        summary: 'Resumen de Música en Madrid',
        locale: 'es',
        publishedAt: '2026-03-01T10:00:00.000Z',
        createdAt: '2026-01-01T10:00:00.000Z',
        updatedAt: '2026-03-05T10:00:00.000Z',
        coverImageAuthor: 'Autora',
        coverImageSourceUrl: 'https://unsplash.com/a',
        imgUrl: undefined,
        writer: null,
        content: content('Música en Madrid'),
      })
      expect(spanish.coverImage).toMatchObject({ name: 'cover-a', alternativeText: 'Portada', width: 1200 })
      expect(spanish.categories?.map(c => [c.code, c.localizedName])).toEqual([
        ['MAC', 'Música y cine'],
        ['TRA', 'Viajes'],
      ])
      expect(spanish.localizations).toMatchObject([
        { id: 101, locale: 'en', title: 'Music in Madrid', coverImage: null },
      ])
      expect(result.find(post => post.id === 200)).toMatchObject({
        coverImage: null,
        imgUrl: 'https://example.com/b.jpg',
        localizations: [],
      })
    })

    it('should keep one post per translation group in the requested locale', async () => {
      await expect(getLatestPostsFromDb({ locale: 'en' }).then(ids)).resolves.toEqual([200, 101])
    })

    it('should apply the limit to each locale before merging', async () => {
      await expect(getLatestPostsFromDb({ limit: 1 }).then(ids)).resolves.toEqual([200, 101])
    })

    it('should filter by category code', async () => {
      await expect(getLatestPostsFromDb({ category: 'MAC' }).then(ids)).resolves.toEqual([101, 100])
    })

    it('should leave the cover out unless asked for', async () => {
      const [post] = await getLatestPostsFromDb({ populate: ['categories'], limit: 1 })

      expect(post!.coverImage).toBeNull()
      expect(post!.categories).not.toBeNull()
    })

    it('should only load the relations asked for', async () => {
      const [post] = await getLatestPostsFromDb({ populate: ['coverImage'], limit: 1 })

      expect(post).toMatchObject({ categories: null, localizations: null, writer: null })
    })
  })

  describe('getAllPostsFromDb', () => {
    it('should list every published post by last update, with localizations and covers but no categories', async () => {
      const result = await getAllPostsFromDb({})

      expect(ids(result)).toEqual([200, 100, 101])
      expect(result[1]).toMatchObject({ categories: null, writer: null, localizations: [{ id: 101 }] })
      expect(result[1]!.coverImage).not.toBeNull()
    })

    it('should localize and filter by category', async () => {
      await expect(getAllPostsFromDb({ locale: 'en' }).then(ids)).resolves.toEqual([200, 101])
      await expect(getAllPostsFromDb({ category: 'MAC' }).then(ids)).resolves.toEqual([100, 101])
    })
  })

  describe('getPostByIdFromDb', () => {
    it('should return a published translation by its public number with every relation, writer included', async () => {
      const post = await getPostByIdFromDb({ id: 101 })

      expect(post).toMatchObject({
        id: 101,
        locale: 'en',
        writer: { name: 'José Madrid', twitter: '@jose', personalUrl: null, avatar: null },
        localizations: [{ id: 100, locale: 'es' }],
      })
      expect(post?.categories?.map(c => c.localizedName)).toEqual(['Music and cinema', 'Travel'])
    })

    it('should leave the writer empty when the post has none', async () => {
      await expect(getPostByIdFromDb({ id: 200 })).resolves.toMatchObject({ writer: null, coverImage: null })
    })

    it('should not return drafts, deleted posts or unknown numbers', async () => {
      await expect(getPostByIdFromDb({ id: 300 })).resolves.toBeUndefined()
      await expect(getPostByIdFromDb({ id: 400 })).resolves.toBeUndefined()
      await expect(getPostByIdFromDb({ id: 999 })).resolves.toBeUndefined()
    })
  })

  describe('searchPostsFromDb', () => {
    beforeEach(() => {
      vi.stubEnv('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME', 'demo')
    })

    it('should match titles ignoring accents and case, in every locale, newest first', async () => {
      const result = await searchPostsFromDb({ query: 'MUSICA' })

      expect(ids(result)).toEqual([100])
      expect(result[0]).toMatchObject({ localizations: null, writer: null })
      expect(result[0]!.categories).toHaveLength(2)
    })

    it('should match summaries too', async () => {
      await expect(searchPostsFromDb({ query: 'resumen de viaje' }).then(ids)).resolves.toEqual([200])
    })

    it('should treat LIKE wildcards in the query literally', async () => {
      await expect(searchPostsFromDb({ query: '100%' }).then(ids)).resolves.toEqual([200])
      await expect(searchPostsFromDb({ query: '_' }).then(ids)).resolves.toEqual([])
    })

    it('should not query for an empty search', async () => {
      await expect(searchPostsFromDb({ query: '   ' })).resolves.toEqual([])
    })
  })

  describe('getPreviewPostFromDb', () => {
    const tokenOf = async (number: number) => {
      const [row] = await testDb.current.db
        .select({ token: postTranslations.previewToken, postId: postTranslations.postId })
        .from(postTranslations)
        .where(eq(postTranslations.number, number))
      return row!
    }

    it('should show a draft with every relation, dated now', async () => {
      const { token } = await tokenOf(300)

      const preview = await getPreviewPostFromDb({ id: 300, token })

      expect(preview).toMatchObject({ id: 300, title: 'Borrador sobre música', coverImage: null, categories: [] })
      expect(Date.now() - new Date(preview!.publishedAt).getTime()).toBeLessThan(60_000)
    })

    it('should apply pending text and shared edits, in their category order', async () => {
      const { db } = testDb.current
      const { token, postId } = await tokenOf(100)
      const [travel] = await db.select().from(categories).where(eq(categories.code, 'TRA'))
      await db
        .update(postTranslations)
        .set({ draft: { title: 'Nuevo título', summary: 'Nuevo', content: content('Nuevo'), savedAt: 'x' } })
        .where(eq(postTranslations.number, 100))
      const draft = {
        cover: { publicId: 'cover-b', width: 800, height: 600 },
        coverImageAuthor: '',
        coverImageSourceUrl: '',
        writerId: '',
        categoryIds: [travel!.id, '00000000-0000-4000-8000-000000000000'],
        savedAt: 'x',
      }
      await db.update(posts).set({ draft }).where(eq(posts.id, postId))

      const preview = await getPreviewPostFromDb({ id: 100, token })

      expect(preview).toMatchObject({
        title: 'Nuevo título',
        publishedAt: '2026-03-01T10:00:00.000Z',
        coverImageAuthor: null,
        coverImageSourceUrl: null,
        writer: null,
      })
      expect(preview!.coverImage).toMatchObject({ name: 'cover-b' })
      expect(preview!.categories?.map(category => category.code)).toEqual(['TRA'])

      await db
        .update(posts)
        .set({ draft: { ...draft, coverImageAuthor: 'Luis', coverImageSourceUrl: 'https://x.com', categoryIds: [] } })
        .where(eq(posts.id, postId))
      await expect(getPreviewPostFromDb({ id: 100, token })).resolves.toMatchObject({
        coverImageAuthor: 'Luis',
        coverImageSourceUrl: 'https://x.com',
        categories: [],
      })
      await db.update(posts).set({ draft: null }).where(eq(posts.id, postId))
      await db.update(postTranslations).set({ draft: null }).where(eq(postTranslations.number, 100))
    })

    it('should need the right token, and not show deleted posts', async () => {
      const { token } = await tokenOf(300)
      const deleted = await tokenOf(400)

      await expect(getPreviewPostFromDb({ id: 100, token })).resolves.toBeUndefined()
      await expect(getPreviewPostFromDb({ id: 400, token: deleted.token })).resolves.toBeUndefined()
    })
  })
})
