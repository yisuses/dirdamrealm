import { eq } from 'drizzle-orm'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import type { PostSaveInput } from '@blog/core/validation/post'
import {
  categories,
  categoryTranslations,
  postCategories,
  postTranslations,
  posts,
  users,
  writers,
} from '@blog/db/schema'
import { type TestDb, createTestDb } from '@blog/test/db'

import {
  applyPostAction,
  createPost,
  createTranslation,
  deletePost,
  getPostForEditor,
  listEditorOptions,
  listPostsForAdmin,
  madridDate,
  publishScheduled,
  savePost,
} from './posts'

const testDb = vi.hoisted(() => ({ current: undefined as unknown as TestDb }))
vi.mock('@blog/db/client', () => ({ getDb: () => testDb.current.db }))

const at = (iso: string) => new Date(iso)
const doc = (text: string) => ({ time: 1, version: '2', blocks: [{ type: 'paragraph' as const, data: { text } }] })
const cover = { publicId: 'portada_1', width: 1200, height: 800 }

let userId: string
let writerId: string
let travel: string
let music: string

function input(overrides: Partial<PostSaveInput> = {}): PostSaveInput {
  return {
    title: 'Viaje a Lisboa',
    summary: 'Una semana en Lisboa',
    content: doc('Primer día'),
    cover,
    coverImageAuthor: 'Ana',
    coverImageSourceUrl: 'https://unsplash.com/x',
    writerId,
    categoryIds: [music, travel],
    ...overrides,
  }
}

async function translationRow(postId: string, locale: 'es' | 'en') {
  const [row] = await testDb.current.db
    .select()
    .from(postTranslations)
    .where(eq(postTranslations.postId, postId))
    .then(rows => rows.filter(r => r.locale === locale))
  return row!
}

async function postRow(postId: string) {
  const [row] = await testDb.current.db.select().from(posts).where(eq(posts.id, postId))
  return row!
}

async function categoryIdsOf(postId: string) {
  const rows = await testDb.current.db
    .select()
    .from(postCategories)
    .where(eq(postCategories.postId, postId))
    .orderBy(postCategories.position)
  return rows.map(row => row.categoryId)
}

describe('admin post queries', () => {
  beforeAll(async () => {
    testDb.current = await createTestDb()
    const { db } = testDb.current
    const [user] = await db
      .insert(users)
      .values({ name: 'José', email: 'jose@example.com', passwordHash: 'h' })
      .returning()
    userId = user!.id
    const [writer] = await db.insert(writers).values({ name: 'José Madrid', userId }).returning()
    writerId = writer!.id
    const [a, b] = await db
      .insert(categories)
      .values([{ code: 'TRA' }, { code: 'MAC' }])
      .returning()
    travel = a!.id
    music = b!.id
    await db.insert(categoryTranslations).values([
      { categoryId: travel, locale: 'es', name: 'Viajes' },
      { categoryId: music, locale: 'es', name: 'Música' },
    ])
  })

  afterAll(async () => {
    await testDb.current.client.close()
  })

  describe('a post from creation to publication', () => {
    let postId: string

    it('should create an empty post signed by the creator, and add its other language once', async () => {
      postId = await createPost('es', userId)

      const editor = await getPostForEditor(postId)
      expect(editor).toMatchObject({
        id: postId,
        live: false,
        fields: { cover: null, coverImageAuthor: '', coverImageSourceUrl: '', writerId, categoryIds: [] },
        translations: { es: { status: 'draft', title: '', hasUnpublishedChanges: false, publishedAt: null } },
      })
      expect(editor!.translations.en).toBeUndefined()

      await expect(createTranslation(postId, 'en')).resolves.toBe(true)
      await expect(createTranslation(postId, 'en')).resolves.toBe(false)
      await expect(createTranslation('00000000-0000-4000-8000-000000000000', 'en')).resolves.toBe(false)
      const anonymous = await createPost('en', '00000000-0000-4000-8000-000000000000')
      expect((await postRow(anonymous)).writerId).toBeNull()
    })

    it('should save an unpublished post in place, categories in order', async () => {
      const savedAt = await savePost(postId, 'es', input(), at('2026-10-20T10:00:00Z'))

      expect(savedAt).toBe('2026-10-20T10:00:00.000Z')
      expect(await translationRow(postId, 'es')).toMatchObject({ title: 'Viaje a Lisboa', draft: null })
      expect(await postRow(postId)).toMatchObject({ cover, coverImageAuthor: 'Ana', writerId, draft: null })
      expect(await categoryIdsOf(postId)).toEqual([music, travel])

      await savePost(
        postId,
        'es',
        input({ categoryIds: [], writerId: '', coverImageAuthor: '', coverImageSourceUrl: '' }),
      )
      expect(await postRow(postId)).toMatchObject({ writerId: null, coverImageAuthor: null, coverImageSourceUrl: null })
      expect(await categoryIdsOf(postId)).toEqual([])
      await savePost(postId, 'es', input())
    })

    it('should not publish without a title and a summary', async () => {
      await savePost(postId, 'en', input({ title: '', summary: '' }))

      await expect(applyPostAction(postId, 'en', { action: 'publish' })).resolves.toEqual({
        ok: false,
        status: 400,
        error: 'Ponle un título antes de publicar',
      })
      await savePost(postId, 'en', input({ title: 'Lisbon', summary: '' }))
      await expect(applyPostAction(postId, 'en', { action: 'publish' })).resolves.toMatchObject({ status: 400 })
    })

    it('should publish a language with today as its date', async () => {
      const now = at('2026-10-21T08:00:00Z')

      await expect(applyPostAction(postId, 'es', { action: 'publish' }, now)).resolves.toEqual({
        ok: true,
        changedSite: true,
      })
      expect(await translationRow(postId, 'es')).toMatchObject({
        status: 'published',
        publishedAt: now,
        updatedAt: now,
      })
      expect((await getPostForEditor(postId))!.live).toBe(true)
    })

    it('should keep edits of a published post off the site until publishing them', async () => {
      const before = await translationRow(postId, 'es')

      await savePost(
        postId,
        'es',
        input({ title: 'Lisboa en otoño', cover: null, categoryIds: [travel] }),
        at('2026-10-22T09:00:00Z'),
      )

      const after = await translationRow(postId, 'es')
      expect(after).toMatchObject({ title: 'Viaje a Lisboa', updatedAt: before.updatedAt })
      expect(after.draft).toMatchObject({ title: 'Lisboa en otoño', savedAt: '2026-10-22T09:00:00.000Z' })
      expect(await postRow(postId)).toMatchObject({ cover, draft: { cover: null, categoryIds: [travel] } })
      expect(await categoryIdsOf(postId)).toEqual([music, travel])

      const editor = await getPostForEditor(postId)
      expect(editor!.fields).toMatchObject({ cover: null, categoryIds: [travel] })
      expect(editor!.translations.es).toMatchObject({
        title: 'Lisboa en otoño',
        hasUnpublishedChanges: true,
        savedAt: '2026-10-22T09:00:00.000Z',
      })
    })

    it('should leave nothing pending when the edits go back to what is published', async () => {
      const published = await translationRow(postId, 'es')
      const content = {
        ...published.content,
        time: 99,
        blocks: published.content.blocks.map(block => ({ ...block, id: 'x' })),
      }

      await savePost(
        postId,
        'es',
        input({ title: published.title, summary: published.summary, content: content as PostSaveInput['content'] }),
      )

      expect((await translationRow(postId, 'es')).draft).toBeNull()
      expect((await postRow(postId)).draft).toBeNull()
      await savePost(postId, 'es', input({ title: 'Lisboa en otoño', cover: null, categoryIds: [travel] }))
    })

    it('should keep a new framing of the published cover pending', async () => {
      const framed = { ...cover, focus: { x: 30, y: 10 }, fit: 'contain' as const }

      await savePost(postId, 'es', input({ cover: framed }))

      expect(await postRow(postId)).toMatchObject({ cover, draft: { cover: framed } })
    })

    it('should let the other, unpublished language write its text in place but not the shared fields', async () => {
      await savePost(postId, 'en', input({ title: 'Lisbon', summary: 'A week', categoryIds: [music] }))

      expect(await translationRow(postId, 'en')).toMatchObject({ title: 'Lisbon', draft: null })
      expect((await postRow(postId)).draft).toMatchObject({ categoryIds: [music] })
      expect((await getPostForEditor(postId))!.translations.en!.hasUnpublishedChanges).toBe(false)
    })

    it('should discard the unpublished edits of a published language', async () => {
      await applyPostAction(postId, 'es', { action: 'discard' })

      expect((await translationRow(postId, 'es')).draft).toBeNull()
      expect((await postRow(postId)).draft).toBeNull()
      expect((await getPostForEditor(postId))!.translations.es).toMatchObject({
        title: 'Viaje a Lisboa',
        hasUnpublishedChanges: false,
      })
      await expect(applyPostAction(postId, 'en', { action: 'discard' })).resolves.toMatchObject({ status: 409 })
    })

    it('should publish pending edits, keeping the original publication date', async () => {
      await savePost(postId, 'es', input({ title: 'Lisboa en otoño', categoryIds: [travel] }))
      const now = at('2026-10-23T08:00:00Z')

      await applyPostAction(postId, 'es', { action: 'publish' }, now)

      expect(await translationRow(postId, 'es')).toMatchObject({
        title: 'Lisboa en otoño',
        draft: null,
        publishedAt: at('2026-10-21T08:00:00Z'),
        updatedAt: now,
      })
      expect((await postRow(postId)).draft).toBeNull()
      expect(await categoryIdsOf(postId)).toEqual([travel])
    })

    it('should not schedule a published language, nor for today or earlier', async () => {
      const now = at('2026-10-23T22:30:00Z') // already the 24th in Madrid

      await expect(applyPostAction(postId, 'es', { action: 'schedule', date: '2026-12-01' })).resolves.toMatchObject({
        status: 409,
      })
      await expect(applyPostAction(postId, 'en', { action: 'schedule', date: '2026-10-24' }, now)).resolves.toEqual({
        ok: false,
        status: 400,
        error: 'Elige un día a partir de mañana',
      })
      await expect(applyPostAction(postId, 'en', { action: 'schedule', date: '2026-10-25' }, now)).resolves.toEqual({
        ok: true,
        changedSite: false,
      })
      expect((await translationRow(postId, 'en')).scheduledFor).toBe('2026-10-25')
      await applyPostAction(postId, 'en', { action: 'schedule', date: null }, now)
      expect((await translationRow(postId, 'en')).scheduledFor).toBeNull()
    })

    it('should unpublish, turning pending edits into the working copy', async () => {
      await savePost(postId, 'es', input({ title: 'Lisboa, borrador', cover: null }))

      await applyPostAction(postId, 'es', { action: 'unpublish' })

      expect(await translationRow(postId, 'es')).toMatchObject({
        status: 'draft',
        title: 'Lisboa, borrador',
        draft: null,
      })
      expect(await postRow(postId)).toMatchObject({ cover: null, draft: null })
      await expect(applyPostAction(postId, 'es', { action: 'unpublish' })).resolves.toMatchObject({ status: 409 })
    })

    it('should keep pending shared edits when another language stays published', async () => {
      await applyPostAction(postId, 'es', { action: 'publish' })
      await applyPostAction(postId, 'en', { action: 'publish' })
      await savePost(postId, 'en', input({ title: 'Lisbon', summary: 'A week', cover }))

      await applyPostAction(postId, 'en', { action: 'unpublish' })

      expect(await postRow(postId)).toMatchObject({ cover: null, draft: { cover } })
    })

    it('should delete the post and refuse to work on it afterwards', async () => {
      await expect(deletePost(postId)).resolves.toBe(true)
      await expect(deletePost(postId)).resolves.toBe(false)

      await expect(getPostForEditor(postId)).resolves.toBeUndefined()
      await expect(savePost(postId, 'es', input())).resolves.toBeUndefined()
      await expect(applyPostAction(postId, 'es', { action: 'publish' })).resolves.toMatchObject({ status: 404 })
    })
  })

  describe('publishScheduled', () => {
    it('should publish what is due by the Madrid date and leave what cannot be published', async () => {
      const due = await createPost('es', userId)
      const later = await createPost('es', userId)
      const untitled = await createPost('es', userId)
      await savePost(due, 'es', input())
      await savePost(later, 'es', input())
      const morning = at('2026-11-02T05:00:00Z')
      for (const [postId, date] of [
        [due, '2026-11-02'],
        [later, '2026-11-03'],
        [untitled, '2026-11-01'],
      ] as const) {
        await applyPostAction(postId, 'es', { action: 'schedule', date }, at('2026-10-01T00:00:00Z'))
      }

      const published = await publishScheduled(morning)

      expect(published).toEqual([(await translationRow(due, 'es')).number])
      expect(await translationRow(due, 'es')).toMatchObject({
        status: 'published',
        scheduledFor: null,
        publishedAt: morning,
      })
      expect(await translationRow(later, 'es')).toMatchObject({ status: 'draft', scheduledFor: '2026-11-03' })
      expect(await translationRow(untitled, 'es')).toMatchObject({ status: 'draft', scheduledFor: '2026-11-01' })
    })
  })

  describe('listPostsForAdmin', () => {
    it('should list by last edit with each language, filtering by text, number, language, state and category', async () => {
      const { db } = testDb.current
      await db.update(posts).set({ deletedAt: new Date() })
      const old = await createPost('es', userId)
      await savePost(old, 'es', input({ title: 'Ópera en Viena', categoryIds: [music] }), at('2026-01-01T00:00:00Z'))
      await db
        .update(postTranslations)
        .set({ updatedAt: at('2026-01-01T00:00:00Z') })
        .where(eq(postTranslations.postId, old))
      const recent = await createPost('en', userId)
      await savePost(recent, 'en', input({ title: 'Lisbon', categoryIds: [travel] }))
      await applyPostAction(recent, 'en', { action: 'publish' })
      await savePost(recent, 'en', input({ title: 'Lisbon in autumn', categoryIds: [travel] }))
      await createTranslation(recent, 'es')
      await applyPostAction(recent, 'es', { action: 'schedule', date: '2099-01-01' })
      const recentNumber = (await translationRow(recent, 'en')).number

      const all = await listPostsForAdmin({})
      expect(all.total).toBe(2)
      expect(all.posts.map(post => post.title)).toEqual(['Lisbon in autumn', 'Ópera en Viena'])
      expect(all.posts[0]).toMatchObject({
        categories: ['Viajes'],
        translations: [
          { locale: 'es', status: 'draft', scheduledFor: '2099-01-01', hasUnpublishedChanges: false },
          { locale: 'en', status: 'published', number: recentNumber, hasUnpublishedChanges: true },
        ],
      })

      const titles = async (filters: Parameters<typeof listPostsForAdmin>[0]) =>
        (await listPostsForAdmin(filters)).posts.map(post => post.title)
      await expect(titles({ query: 'opera' })).resolves.toEqual(['Ópera en Viena'])
      await expect(titles({ query: String(recentNumber) })).resolves.toEqual(['Lisbon in autumn'])
      await expect(titles({ query: '100%' })).resolves.toEqual([])
      await expect(titles({ locale: 'en' })).resolves.toEqual(['Lisbon in autumn'])
      await expect(titles({ status: 'published' })).resolves.toEqual(['Lisbon in autumn'])
      await expect(titles({ status: 'scheduled' })).resolves.toEqual(['Lisbon in autumn'])
      await expect(titles({ status: 'draft' })).resolves.toEqual(['Ópera en Viena'])
      await expect(titles({ categoryId: music })).resolves.toEqual(['Ópera en Viena'])
      await expect(listPostsForAdmin({ page: 2 })).resolves.toEqual({ posts: [], total: 2 })
      await expect(titles({ page: 0 })).resolves.toHaveLength(2)
    })

    it('should show untitled posts with an empty title', async () => {
      await createPost('es', userId)

      expect((await listPostsForAdmin({ status: 'draft' })).posts[0]!.title).toBe('')
    })
  })

  describe('posts without writer or photo credits', () => {
    it('should read and compare the missing shared fields as empty, and flag shared edits alone', async () => {
      const postId = await createPost('es', '00000000-0000-4000-8000-000000000000')
      const empty = input({ cover: null, coverImageAuthor: '', coverImageSourceUrl: '', writerId: '', categoryIds: [] })
      expect((await getPostForEditor(postId))!.fields).toEqual({
        cover: null,
        coverImageAuthor: '',
        coverImageSourceUrl: '',
        writerId: '',
        categoryIds: [],
      })

      await savePost(postId, 'es', empty)
      await applyPostAction(postId, 'es', { action: 'publish' })
      await savePost(postId, 'es', empty)
      expect((await postRow(postId)).draft).toBeNull()

      await savePost(postId, 'es', { ...empty, writerId })
      expect((await translationRow(postId, 'es')).draft).toBeNull()
      const [row] = (await listPostsForAdmin({ query: 'Viaje a Lisboa' })).posts
      expect(row!.translations).toEqual([expect.objectContaining({ status: 'published', hasUnpublishedChanges: true })])
    })
  })

  it('should offer writers and categories by name', async () => {
    await expect(listEditorOptions()).resolves.toEqual({
      writers: [{ id: writerId, name: 'José Madrid' }],
      categories: [
        { id: music, name: 'Música' },
        { id: travel, name: 'Viajes' },
      ],
    })
  })

  it('should give the Madrid date, which differs from UTC late at night', () => {
    expect(madridDate(at('2026-07-01T21:59:00Z'))).toBe('2026-07-01')
    expect(madridDate(at('2026-07-01T22:00:00Z'))).toBe('2026-07-02')
    expect(madridDate(at('2026-01-01T22:59:00Z'))).toBe('2026-01-01')
  })
})
