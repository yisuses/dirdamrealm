import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { postCategories, posts } from '@blog/db/schema'
import { type TestDb, createTestDb } from '@blog/test/db'

import {
  createCategory,
  deleteCategory,
  getCategoryForAdmin,
  isCategoryCodeTaken,
  listCategoriesForAdmin,
  updateCategory,
} from './categories'

const testDb = vi.hoisted(() => ({ current: undefined as unknown as TestDb }))
vi.mock('@blog/db/client', () => ({ getDb: () => testDb.current.db }))

const input = (code: string, name: string) => ({
  code,
  main: true,
  es: { name, description: `Sobre ${name}` },
  en: { name: `${name} (en)`, description: '' },
})
const missing = '00000000-0000-0000-0000-000000000000'

describe('admin category queries', () => {
  beforeAll(async () => {
    testDb.current = await createTestDb()
  })

  afterAll(async () => {
    await testDb.current.client.close()
  })

  it('should create a category with both translations and list it with its post count', async () => {
    const id = await createCategory(input('VIAJES', 'Viajes'))
    const [post] = await testDb.current.db.insert(posts).values({}).returning()
    await testDb.current.db.insert(postCategories).values({ postId: post!.id, categoryId: id })

    await expect(listCategoriesForAdmin()).resolves.toEqual([
      {
        id,
        code: 'VIAJES',
        main: true,
        es: { name: 'Viajes', description: 'Sobre Viajes' },
        en: { name: 'Viajes (en)', description: '' },
        posts: 1,
      },
    ])
  })

  it('should say whether a code is taken, ignoring the category being edited', async () => {
    const [category] = await listCategoriesForAdmin()

    await expect(isCategoryCodeTaken('VIAJES')).resolves.toBe(true)
    await expect(isCategoryCodeTaken('VIAJES', category!.id)).resolves.toBe(false)
    await expect(isCategoryCodeTaken('OTRA')).resolves.toBe(false)
  })

  it('should update the code, the menu flag and both translations', async () => {
    const [category] = await listCategoriesForAdmin()

    await expect(updateCategory(category!.id, { ...input('VIAJE', 'Viaje'), main: false })).resolves.toBe(true)
    await expect(getCategoryForAdmin(category!.id)).resolves.toMatchObject({
      code: 'VIAJE',
      main: false,
      es: { name: 'Viaje' },
      en: { name: 'Viaje (en)' },
    })
  })

  it('should report categories that do not exist', async () => {
    await expect(updateCategory(missing, input('X', 'X'))).resolves.toBe(false)
    await expect(deleteCategory(missing)).resolves.toBe(false)
    await expect(getCategoryForAdmin(missing)).resolves.toBeUndefined()
  })

  it('should delete a category and take it off its posts, keeping the posts', async () => {
    const [category] = await listCategoriesForAdmin()

    await expect(deleteCategory(category!.id)).resolves.toBe(true)
    await expect(listCategoriesForAdmin()).resolves.toEqual([])
    await expect(testDb.current.db.select().from(postCategories)).resolves.toEqual([])
    await expect(testDb.current.db.select().from(posts)).resolves.toHaveLength(1)
  })

  it('should show empty texts for a category missing a translation', async () => {
    const id = await createCategory(input('SOLO', 'Solo'))
    await testDb.current.client.query(`delete from category_translations where locale = 'en'`)

    await expect(getCategoryForAdmin(id)).resolves.toMatchObject({ en: { name: '', description: '' }, posts: 0 })
  })
})
