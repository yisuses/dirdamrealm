import { eq, sql } from 'drizzle-orm'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { comments, postTranslations, posts, users, writers } from '@blog/db/schema'
import { type TestDb, createTestDb } from '@blog/test/db'

import { createCommentInDb, getCommentsFromDb, getPostAuthorEmail, getPublishedSiblings } from './comments'

const testDb = vi.hoisted(() => ({ current: undefined as unknown as TestDb }))
vi.mock('@blog/db/client', () => ({ getDb: () => testDb.current.db }))

const content = { time: 0, version: '', blocks: [] }

describe('getCommentsFromDb', () => {
  beforeAll(async () => {
    testDb.current = await createTestDb()
    const { db } = testDb.current
    const [post] = await db.insert(posts).values({}).returning()
    await db.insert(postTranslations).values([
      {
        postId: post!.id,
        locale: 'es',
        number: 10,
        title: 'Hola',
        summary: 's',
        content,
        status: 'published',
        publishedAt: new Date(),
      },
      {
        postId: post!.id,
        locale: 'en',
        number: 11,
        title: 'Hello',
        summary: 's',
        content,
        status: 'published',
        publishedAt: new Date(),
      },
    ])
    const [draftOnly, deleted] = await db
      .insert(posts)
      .values([{}, { deletedAt: new Date() }])
      .returning()
    await db.insert(postTranslations).values([
      { postId: draftOnly!.id, locale: 'es', number: 20, title: 'Borrador', summary: 's', content },
      {
        postId: deleted!.id,
        locale: 'es',
        number: 30,
        title: 'Borrada',
        summary: 's',
        content,
        status: 'published',
        publishedAt: new Date(),
      },
    ])
    await db.insert(comments).values([
      { id: 1, postNumber: 10, author: 'Ana', text: 'Primero', createdAt: new Date('2026-01-01T00:00:00Z') },
      { id: 2, postNumber: 11, author: 'Bob', text: 'Second', createdAt: new Date('2026-02-01T00:00:00Z') },
    ])
    // As the migration does: new comments continue after the ids kept from Strapi.
    await db.execute(sql`select setval(pg_get_serial_sequence('comments', 'id'), 100)`)
  })

  afterAll(async () => {
    await testDb.current.client.close()
  })

  it('should return the comments of every given post number, newest first', async () => {
    await expect(getCommentsFromDb({ ids: [10, 11] })).resolves.toEqual([
      {
        id: 2,
        author: 'Bob',
        text: 'Second',
        createdAt: '2026-02-01T00:00:00.000Z',
        updatedAt: '2026-02-01T00:00:00.000Z',
      },
      {
        id: 1,
        author: 'Ana',
        text: 'Primero',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    ])
  })

  it('should only return comments of the requested posts', async () => {
    await expect(getCommentsFromDb({ ids: [10] })).resolves.toHaveLength(1)
  })

  it('should not query without post numbers', async () => {
    await expect(getCommentsFromDb({ ids: [] })).resolves.toEqual([])
    await expect(getCommentsFromDb({})).resolves.toEqual([])
  })

  describe('comments on the post pages', () => {
    it('should give the published languages of a post, Spanish first, from any of its numbers', async () => {
      const pages = [
        { number: 10, locale: 'es', title: 'Hola' },
        { number: 11, locale: 'en', title: 'Hello' },
      ]
      await expect(getPublishedSiblings(11)).resolves.toEqual(pages)
      await expect(getPublishedSiblings(10)).resolves.toEqual(pages)
    })

    it('should give no pages for unknown numbers or deleted posts', async () => {
      await expect(getPublishedSiblings(999)).resolves.toEqual([])
      await expect(getPublishedSiblings(30)).resolves.toEqual([])
    })

    it('should save a comment on a published post, with the pages that show it', async () => {
      const created = await createCommentInDb({ postNumber: 11, author: 'Carla', text: 'Great' })

      expect(created).toEqual({
        id: expect.any(Number),
        post: { number: 11, locale: 'en', title: 'Hello' },
        pages: [
          { number: 10, locale: 'es', title: 'Hola' },
          { number: 11, locale: 'en', title: 'Hello' },
        ],
      })
      await expect(getCommentsFromDb({ ids: [11] })).resolves.toEqual(
        expect.arrayContaining([expect.objectContaining({ id: created!.id, author: 'Carla', text: 'Great' })]),
      )
    })

    it('should not save comments on drafts, deleted or unknown posts', async () => {
      await expect(createCommentInDb({ postNumber: 20, author: 'x', text: 'y' })).resolves.toBeUndefined()
      await expect(createCommentInDb({ postNumber: 30, author: 'x', text: 'y' })).resolves.toBeUndefined()
      await expect(createCommentInDb({ postNumber: 999, author: 'x', text: 'y' })).resolves.toBeUndefined()
    })

    it("should give the email of a post's author only through an active panel user", async () => {
      const { db } = testDb.current
      const [active, inactive] = await db
        .insert(users)
        .values([
          { name: 'José', email: 'jose@example.com', passwordHash: 'h' },
          { name: 'Ana', email: 'ana@example.com', passwordHash: 'h', active: false },
        ])
        .returning()
      const [jose, ana, unlinked] = await db
        .insert(writers)
        .values([
          { name: 'José Madrid', userId: active!.id },
          { name: 'Ana', userId: inactive!.id },
          { name: 'Sin usuario' },
        ])
        .returning()
      const postOf = async (number: number) =>
        (await db.select().from(postTranslations).where(eq(postTranslations.number, number)))[0]!.postId

      await expect(getPostAuthorEmail(10)).resolves.toBeUndefined()
      await db
        .update(posts)
        .set({ writerId: jose!.id })
        .where(eq(posts.id, await postOf(10)))
      await expect(getPostAuthorEmail(10)).resolves.toBe('jose@example.com')
      await expect(getPostAuthorEmail(11)).resolves.toBe('jose@example.com')
      await db
        .update(posts)
        .set({ writerId: ana!.id })
        .where(eq(posts.id, await postOf(20)))
      await expect(getPostAuthorEmail(20)).resolves.toBeUndefined()
      await db
        .update(posts)
        .set({ writerId: unlinked!.id })
        .where(eq(posts.id, await postOf(30)))
      await expect(getPostAuthorEmail(30)).resolves.toBeUndefined()
      await expect(getPostAuthorEmail(999)).resolves.toBeUndefined()
    })
  })
})
