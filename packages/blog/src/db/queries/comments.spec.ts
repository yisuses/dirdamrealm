import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { comments, postTranslations, posts } from '@blog/db/schema'
import { type TestDb, createTestDb } from '@blog/test/db'

import { getCommentsFromDb } from './comments'

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
    await db.insert(comments).values([
      { id: 1, postNumber: 10, author: 'Ana', text: 'Primero', createdAt: new Date('2026-01-01T00:00:00Z') },
      { id: 2, postNumber: 11, author: 'Bob', text: 'Second', createdAt: new Date('2026-02-01T00:00:00Z') },
    ])
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
})
