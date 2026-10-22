import { asc, desc, eq } from 'drizzle-orm'

import { getDb } from '../client'
import { categories, categoryTranslations } from '../schema'

interface GetCategoriesParams {
  locale?: AppLocales
  code?: string
  sort?: string[]
}

/** Same contract as the Strapi `getCategories`: every category, localized for `locale`. */
export async function getCategoriesFromDb({ locale = 'en', code, sort }: GetCategoriesParams): Promise<Category[]> {
  const db = getDb()
  const newestFirst = sort?.includes('updatedAt:desc')
  const rows = await db
    .select()
    .from(categories)
    .where(code ? eq(categories.code, code) : undefined)
    // Strapi listed by id, i.e. creation order, which is also the header's menu order.
    .orderBy(newestFirst ? desc(categories.updatedAt) : asc(categories.createdAt), asc(categories.code))
  if (rows.length === 0) {
    return []
  }

  const translations = await db.select().from(categoryTranslations)
  const allIds = await db.select({ id: categories.id }).from(categories).orderBy(asc(categories.createdAt))
  const numericId = new Map(allIds.map(({ id }, index) => [id, index + 1]))

  return rows.map(row => toCategory(row, translations, locale, numericId.get(row.id) ?? 0))
}

export function toCategory(
  row: typeof categories.$inferSelect,
  translations: (typeof categoryTranslations.$inferSelect)[],
  locale: AppLocales,
  id: number,
): Category {
  const own = translations.filter(t => t.categoryId === row.id)
  const byLocale = Object.fromEntries(own.map(t => [t.locale, t.name])) as Record<AppLocales, string>
  // Strapi's base `name` was the English one, translated through the `translations` JSON.
  const name = byLocale.en ?? byLocale.es ?? row.code
  return {
    id,
    code: row.code,
    main: row.main,
    name,
    translations: byLocale,
    description: own[0]?.description ?? '',
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    localizedName: byLocale[locale] || name,
  }
}
