import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { siteContact, siteContactTranslations, socialLinks } from '@blog/db/schema'
import { type TestDb, createTestDb } from '@blog/test/db'

import { getAboutFromDb } from './about'

const testDb = vi.hoisted(() => ({ current: undefined as unknown as TestDb }))
vi.mock('@blog/db/client', () => ({ getDb: () => testDb.current.db }))

describe('getAboutFromDb', () => {
  beforeEach(async () => {
    await testDb.current?.client.close()
    testDb.current = await createTestDb()
  })

  afterAll(async () => {
    await testDb.current.client.close()
  })

  it('should be undefined until the contact block exists', async () => {
    await expect(getAboutFromDb()).resolves.toBeUndefined()
  })

  it('should combine the contact block and the visible social links', async () => {
    const { db } = testDb.current
    await db
      .insert(siteContact)
      .values({ display: true, name: 'Emoción Blanca', email: 'hola@whe.com', updatedAt: new Date(0) })
    await db.insert(siteContactTranslations).values({ locale: 'en', description: 'About us' })
    await db.insert(socialLinks).values([
      { network: 'twitter', handle: '@whe', url: 'https://x.com/whe', position: 0 },
      { network: 'instagram', handle: null, url: 'https://instagram.com/whe', position: 1 },
      { network: 'facebook', url: 'https://facebook.com/whe', position: 2, visible: false },
    ])

    await expect(getAboutFromDb()).resolves.toEqual({
      id: 1,
      display: true,
      name: 'Emoción Blanca',
      email: 'hola@whe.com',
      twitter: '@whe',
      twitterUrl: 'https://x.com/whe',
      instagram: undefined,
      instagramUrl: 'https://instagram.com/whe',
      description: 'About us',
      createdAt: '1970-01-01T00:00:00.000Z',
      updatedAt: '1970-01-01T00:00:00.000Z',
      locale: 'en',
    })
  })

  it('should leave missing contact fields and description undefined', async () => {
    await testDb.current.db.insert(siteContact).values({ display: false })

    await expect(getAboutFromDb()).resolves.toMatchObject({
      display: false,
      name: undefined,
      email: undefined,
      description: undefined,
    })
  })
})
