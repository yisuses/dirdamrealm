import { asc, count, eq } from 'drizzle-orm'

import type { CategoryInput } from '@blog/core/validation/category'

import { getDb } from '../../client'
import { categories, categoryTranslations, postCategories } from '../../schema'

export interface AdminCategory extends CategoryInput {
  id: string
  posts: number
}

/** Every category with both translations and how many posts use it, in menu order. */
export async function listCategoriesForAdmin(): Promise<AdminCategory[]> {
  const db = getDb()
  const rows = await db.select().from(categories).orderBy(asc(categories.createdAt))
  const translations = await db.select().from(categoryTranslations)
  const usage = await db
    .select({ categoryId: postCategories.categoryId, posts: count() })
    .from(postCategories)
    .groupBy(postCategories.categoryId)

  return rows.map(row => {
    const of = (locale: AppLocales) => {
      const translation = translations.find(t => t.categoryId === row.id && t.locale === locale)
      return { name: translation?.name ?? '', description: translation?.description ?? '' }
    }
    return {
      id: row.id,
      code: row.code,
      main: row.main,
      es: of('es'),
      en: of('en'),
      posts: usage.find(u => u.categoryId === row.id)?.posts ?? 0,
    }
  })
}

export async function getCategoryForAdmin(id: string) {
  return (await listCategoriesForAdmin()).find(category => category.id === id)
}

export async function isCategoryCodeTaken(code: string, exceptId?: string) {
  const [existing] = await getDb().select({ id: categories.id }).from(categories).where(eq(categories.code, code))
  return Boolean(existing && existing.id !== exceptId)
}

function translationRows(categoryId: string, input: CategoryInput) {
  return (['es', 'en'] as const).map(locale => ({ categoryId, locale, ...input[locale] }))
}

export async function createCategory(input: CategoryInput) {
  return getDb().transaction(async tx => {
    const [created] = await tx.insert(categories).values({ code: input.code, main: input.main }).returning()
    await tx.insert(categoryTranslations).values(translationRows(created!.id, input))
    return created!.id
  })
}

/** Returns false when the category does not exist. */
export async function updateCategory(id: string, input: CategoryInput) {
  return getDb().transaction(async tx => {
    const updated = await tx
      .update(categories)
      .set({ code: input.code, main: input.main })
      .where(eq(categories.id, id))
      .returning({ id: categories.id })
    if (updated.length === 0) {
      return false
    }
    await tx.delete(categoryTranslations).where(eq(categoryTranslations.categoryId, id))
    await tx.insert(categoryTranslations).values(translationRows(id, input))
    return true
  })
}

/** Deleting a category takes it off its posts too (the link rows cascade). */
export async function deleteCategory(id: string) {
  const deleted = await getDb().delete(categories).where(eq(categories.id, id)).returning({ id: categories.id })
  return deleted.length > 0
}
