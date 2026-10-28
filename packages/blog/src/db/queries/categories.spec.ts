import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { categories, categoryTranslations } from '@blog/db/schema'
import { type TestDb, createTestDb } from '@blog/test/db'

import { getCategoriesFromDb, toCategory } from './categories'

const testDb = vi.hoisted(() => ({ current: undefined as unknown as TestDb }))
vi.mock('@blog/db/client', () => ({ getDb: () => testDb.current.db }))

describe('getCategoriesFromDb', () => {
  beforeAll(async () => {
    testDb.current = await createTestDb()
    const { db } = testDb.current
    const [travel, music] = await db
      .insert(categories)
      .values([
        { code: 'TRA', main: true, createdAt: new Date('2026-01-01'), updatedAt: new Date('2026-01-05') },
        { code: 'MAC', main: false, createdAt: new Date('2026-01-02'), updatedAt: new Date('2026-01-09') },
      ])
      .returning()
    await db.insert(categoryTranslations).values([
      { categoryId: travel!.id, locale: 'es', name: 'Viajes', description: 'Por el mundo' },
      { categoryId: travel!.id, locale: 'en', name: 'Travel', description: 'Por el mundo' },
      { categoryId: music!.id, locale: 'es', name: 'Música', description: '' },
    ])
  })

  afterAll(async () => {
    await testDb.current.client.close()
  })

  it('should list categories in creation order, named for the locale, in English by default', async () => {
    const result = await getCategoriesFromDb({})

    expect(result.map(c => [c.id, c.code, c.localizedName])).toEqual([
      [1, 'TRA', 'Travel'],
      [2, 'MAC', 'Música'],
    ])
    expect(result[0]).toEqual({
      id: 1,
      code: 'TRA',
      main: true,
      name: 'Travel',
      translations: { es: 'Viajes', en: 'Travel' },
      description: 'Por el mundo',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-05T00:00:00.000Z',
      localizedName: 'Travel',
    })
  })

  it('should localize and filter by code', async () => {
    await expect(getCategoriesFromDb({ locale: 'es', code: 'TRA' })).resolves.toMatchObject([
      { code: 'TRA', localizedName: 'Viajes' },
    ])
  })

  it('should sort by last update when asked, as the sitemap does', async () => {
    const result = await getCategoriesFromDb({ sort: ['updatedAt:desc'] })

    expect(result.map(c => c.code)).toEqual(['MAC', 'TRA'])
  })

  it('should return nothing for an unknown code', async () => {
    await expect(getCategoriesFromDb({ code: 'XXX' })).resolves.toEqual([])
  })
})

describe('toCategory', () => {
  it('should fall back to the code when a category has no translation at all', () => {
    const row = { id: 'x', code: 'NEW', main: false, createdAt: new Date(0), updatedAt: new Date(0) }

    expect(toCategory(row, [], 'es', 7)).toMatchObject({ id: 7, name: 'NEW', localizedName: 'NEW', description: '' })
  })
})
