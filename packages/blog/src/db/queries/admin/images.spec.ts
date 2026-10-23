import type { DataProp } from 'editorjs-blocks-react-renderer'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { postTranslations, posts } from '@blog/db/schema'
import { type TestDb, createTestDb } from '@blog/test/db'

import { findImageUsage } from './images'

const testDb = vi.hoisted(() => ({ current: undefined as unknown as TestDb }))
vi.mock('@blog/db/client', () => ({ getDb: () => testDb.current.db }))

const url = (publicId: string) => `https://res.cloudinary.com/demo/image/upload/v1/${publicId}.png`
const image = (publicId: string) => ({ type: 'image', data: { file: { url: url(publicId) } } })
const doc = (...blocks: object[]) => ({ time: 1, version: '2', blocks }) as unknown as DataProp

describe('findImageUsage', () => {
  beforeAll(async () => {
    testDb.current = await createTestDb()
    const { db } = testDb.current
    const [withCover, withContent, deleted, legacy, pendingCover] = await db
      .insert(posts)
      .values([
        { cover: { publicId: 'portada_1', width: 1, height: 1 } },
        {},
        { deletedAt: new Date(), cover: { publicId: 'portada_1', width: 1, height: 1 } },
        { imgUrl: url('antigua_1') },
        {
          draft: {
            cover: { publicId: 'nueva_portada', width: 1, height: 1 },
            coverImageAuthor: '',
            coverImageSourceUrl: '',
            writerId: '',
            categoryIds: [],
            savedAt: '2026-10-22T10:00:00.000Z',
          },
        },
      ])
      .returning()
    const translation = (
      postId: string,
      locale: 'es' | 'en',
      number: number,
      content = doc(),
    ): typeof postTranslations.$inferInsert => ({
      postId,
      locale,
      number,
      title: `Entrada ${number}`,
      summary: '',
      content,
    })
    await db.insert(postTranslations).values([
      { ...translation(withCover!.id, 'es', 10), status: 'published' as const, publishedAt: new Date() },
      translation(withCover!.id, 'en', 11, doc(image('portada_1'))),
      {
        ...translation(withContent!.id, 'es', 20, doc(image('small_dentro_1'))),
        draft: {
          title: '',
          summary: '',
          content: doc({ type: 'image', data: { publicId: 'dentro_1' } }),
          savedAt: '2026-10-22T10:00:00.000Z',
        },
      },
      translation(deleted!.id, 'es', 30),
      translation(legacy!.id, 'es', 40),
      translation(pendingCover!.id, 'es', 50),
    ])
  })

  afterAll(async () => {
    await testDb.current.client.close()
  })

  it('should find covers and images in the text of every translation, by number', async () => {
    await expect(findImageUsage('portada_1')).resolves.toEqual([
      { number: 10, locale: 'es', title: 'Entrada 10', status: 'published', cover: true, content: false },
      { number: 11, locale: 'en', title: 'Entrada 11', status: 'draft', cover: true, content: true },
    ])
  })

  it('should find images in unpublished edits by id, but not Strapi copies of them', async () => {
    await expect(findImageUsage('dentro_1')).resolves.toEqual([expect.objectContaining({ number: 20, content: true })])
    await expect(findImageUsage('dentro')).resolves.toEqual([])
  })

  it('should find old posts whose cover is a plain url, and ignore deleted posts', async () => {
    await expect(findImageUsage('antigua_1')).resolves.toEqual([expect.objectContaining({ number: 40, cover: true })])
    await expect(findImageUsage('sin_usar')).resolves.toEqual([])
  })

  it("should find a cover that waits in a post's draft to be published", async () => {
    await expect(findImageUsage('nueva_portada')).resolves.toEqual([
      expect.objectContaining({ number: 50, cover: true }),
    ])
  })
})
