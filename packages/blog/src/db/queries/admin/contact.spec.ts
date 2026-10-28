import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { socialLinks } from '@blog/db/schema'
import { type TestDb, createTestDb } from '@blog/test/db'

import { getContactForAdmin, saveContact } from './contact'

const testDb = vi.hoisted(() => ({ current: undefined as unknown as TestDb }))
vi.mock('@blog/db/client', () => ({ getDb: () => testDb.current.db }))

describe('admin contact queries', () => {
  beforeAll(async () => {
    testDb.current = await createTestDb()
  })

  afterAll(async () => {
    await testDb.current.client.close()
  })

  it('should offer an empty, visible block before the first save', async () => {
    await expect(getContactForAdmin()).resolves.toEqual({ display: true, name: '', email: '', socialLinks: [] })
  })

  it('should save the block and the links in the order given, and read them back', async () => {
    const input = {
      display: false,
      name: 'Emoción Blanca',
      email: 'hola@whemotion.com',
      socialLinks: [
        { network: 'instagram' as const, handle: 'whe', url: 'https://instagram.com/whe', visible: true },
        { network: 'twitter' as const, handle: '', url: 'https://x.com/whe', visible: false },
      ],
    }

    await saveContact(input)
    await expect(getContactForAdmin()).resolves.toEqual(input)
  })

  it('should replace the links on every save and store empty texts as missing', async () => {
    await saveContact({ display: true, name: '', email: '', socialLinks: [] })

    await expect(getContactForAdmin()).resolves.toEqual({ display: true, name: '', email: '', socialLinks: [] })
    await expect(testDb.current.db.select().from(socialLinks)).resolves.toEqual([])
  })

  it('should leave out links of networks the footer cannot show', async () => {
    await testDb.current.db.insert(socialLinks).values({ network: 'myspace', url: 'https://myspace.com/x' })

    await expect(getContactForAdmin()).resolves.toMatchObject({ socialLinks: [] })
  })
})
