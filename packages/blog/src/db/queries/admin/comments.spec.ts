import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { comments, postTranslations, posts } from '@blog/db/schema'
import { type TestDb, createTestDb } from '@blog/test/db'

import { deleteComment, listCommentsForAdmin } from './comments'

const testDb = vi.hoisted(() => ({ current: undefined as unknown as TestDb }))
vi.mock('@blog/db/client', () => ({ getDb: () => testDb.current.db }))

const content = { time: 0, version: '', blocks: [] }
const at = (day: number) => new Date(Date.UTC(2026, 0, day))

describe('admin comment queries', () => {
  let livePostId: string

  beforeAll(async () => {
    testDb.current = await createTestDb()
    const { db } = testDb.current
    const [live, draft, deleted] = await db
      .insert(posts)
      .values([{}, {}, { deletedAt: new Date() }])
      .returning()
    livePostId = live!.id
    const published = { status: 'published' as const, publishedAt: new Date(), summary: 's', content }
    await db.insert(postTranslations).values([
      { postId: live!.id, locale: 'es', number: 10, title: 'Hola', ...published },
      { postId: live!.id, locale: 'en', number: 11, title: 'Hello', ...published },
      { postId: draft!.id, locale: 'es', number: 20, title: 'Borrador', summary: 's', content },
      { postId: deleted!.id, locale: 'es', number: 30, title: 'Borrada', ...published },
    ])
    await db.insert(comments).values([
      { id: 1, postNumber: 10, author: 'Ana', text: 'Me gustó mucho', createdAt: at(1) },
      { id: 2, postNumber: 11, author: 'Bob', text: '100% agree', createdAt: at(2) },
      { id: 3, postNumber: 20, author: 'Íñigo', text: 'En un borrador', createdAt: at(3) },
      { id: 4, postNumber: 30, author: 'Zoe', text: 'En una borrada', createdAt: at(4) },
    ])
  })

  afterAll(async () => {
    await testDb.current.client.close()
  })

  it('should list comments of existing posts, newest first, with their post', async () => {
    const { comments: list, total } = await listCommentsForAdmin({})

    expect(total).toBe(3)
    expect(list.map(comment => comment.id)).toEqual([3, 2, 1])
    expect(list[1]).toEqual({
      id: 2,
      author: 'Bob',
      text: '100% agree',
      createdAt: at(2).toISOString(),
      post: { id: livePostId, number: 11, locale: 'en', title: 'Hello', published: true },
    })
    expect(list[0]!.post).toMatchObject({ title: 'Borrador', published: false })
  })

  it('should search author and text ignoring accents, case and wildcards', async () => {
    const ids = async (query: string) => (await listCommentsForAdmin({ query })).comments.map(c => c.id)

    await expect(ids('inigo')).resolves.toEqual([3])
    await expect(ids('GUSTO')).resolves.toEqual([1])
    await expect(ids('100%')).resolves.toEqual([2])
    await expect(ids('_')).resolves.toEqual([])
    await expect(ids('   ')).resolves.toEqual([3, 2, 1])
  })

  it('should page 25 at a time, treating pages below one as the first', async () => {
    const { db } = testDb.current
    await db.insert(comments).values(
      Array.from({ length: 25 }, (_, index) => ({
        id: 100 + index,
        postNumber: 10,
        author: 'Lector',
        text: `Comentario ${index}`,
        createdAt: at(10),
      })),
    )

    const first = await listCommentsForAdmin({ page: 0 })
    const second = await listCommentsForAdmin({ page: 2 })

    expect(first.total).toBe(28)
    expect(first.comments).toHaveLength(25)
    expect(second.comments.map(comment => comment.id)).toEqual([3, 2, 1])
  })

  it('should delete a comment and give the pages that showed it', async () => {
    await expect(deleteComment(2)).resolves.toEqual([
      { number: 10, locale: 'es', title: 'Hola' },
      { number: 11, locale: 'en', title: 'Hello' },
    ])
    await expect(deleteComment(3)).resolves.toEqual([])
    await expect(deleteComment(2)).resolves.toBeUndefined()
  })
})
