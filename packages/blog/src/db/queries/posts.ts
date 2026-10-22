import { type SQL, and, asc, desc, eq, exists, inArray, isNull, sql } from 'drizzle-orm'

import { LOCALES } from '@blog/core/i18n/config'
import { getLocalizedPosts } from '@blog/utils/getLocalizedPosts/getLocalizedPosts'

import { getDb } from '../client'
import { categories, categoryTranslations, postCategories, postTranslations, posts, writers } from '../schema'
import { toCategory } from './categories'
import { toMedia } from './media'

type Relation = 'categories' | 'coverImage' | 'localizations' | 'writer'
type Row = { translation: typeof postTranslations.$inferSelect; post: typeof posts.$inferSelect }

const isPublished = and(eq(postTranslations.status, 'published'), isNull(posts.deletedAt))

function inCategory(code: string) {
  const db = getDb()
  return exists(
    db
      .select({ one: sql`1` })
      .from(postCategories)
      .innerJoin(categories, eq(categories.id, postCategories.categoryId))
      .where(and(eq(postCategories.postId, posts.id), eq(categories.code, code))),
  )
}

function selectRows(where: SQL | undefined, orderBy: SQL[], limit?: number) {
  const query = getDb()
    .select({ translation: postTranslations, post: posts })
    .from(postTranslations)
    .innerJoin(posts, eq(posts.id, postTranslations.postId))
    .where(and(isPublished, where))
    .orderBy(...orderBy)
  return limit ? query.limit(limit) : query
}

function toPost({ translation, post }: Row): Post {
  return {
    id: translation.number,
    title: translation.title,
    summary: translation.summary,
    imgUrl: post.imgUrl ?? undefined,
    publishedAt: (translation.publishedAt ?? translation.createdAt).toISOString(),
    createdAt: translation.createdAt.toISOString(),
    updatedAt: translation.updatedAt.toISOString(),
    content: translation.content,
    coverImage: null,
    coverImageAuthor: post.coverImageAuthor,
    coverImageSourceUrl: post.coverImageSourceUrl,
    categories: null,
    localizations: null,
    locale: translation.locale,
    writer: null,
  }
}

/**
 * Builds `Post`s with the relations each caller used to `populate` from Strapi, so lists and
 * pages receive exactly the shape they always have (e.g. the writer only on the post page).
 */
async function hydrate(rows: Row[], relations: Relation[]): Promise<Post[]> {
  if (rows.length === 0) {
    return []
  }
  const db = getDb()
  const postIds = [...new Set(rows.map(row => row.post.id))]
  const result = rows.map(toPost)

  if (relations.includes('coverImage')) {
    rows.forEach((row, index) => {
      result[index]!.coverImage = row.post.cover ? toMedia(row.post.cover) : null
    })
  }

  if (relations.includes('categories')) {
    const links = await db
      .select({ postId: postCategories.postId, category: categories })
      .from(postCategories)
      .innerJoin(categories, eq(categories.id, postCategories.categoryId))
      .where(inArray(postCategories.postId, postIds))
      .orderBy(asc(postCategories.position), asc(categories.createdAt))
    const translations = await db.select().from(categoryTranslations)
    const ordered = await db.select({ id: categories.id }).from(categories).orderBy(asc(categories.createdAt))
    const numericId = new Map(ordered.map(({ id }, index) => [id, index + 1]))
    rows.forEach((row, index) => {
      result[index]!.categories = links
        .filter(link => link.postId === row.post.id)
        .map(link =>
          toCategory(link.category, translations, row.translation.locale, numericId.get(link.category.id) ?? 0),
        )
    })
  }

  if (relations.includes('localizations')) {
    const siblings = await selectRows(inArray(postTranslations.postId, postIds), [asc(postTranslations.locale)])
    rows.forEach((row, index) => {
      result[index]!.localizations = siblings
        .filter(s => s.post.id === row.post.id && s.translation.locale !== row.translation.locale)
        .map(toPost)
    })
  }

  if (relations.includes('writer')) {
    const writerIds = [...new Set(rows.map(row => row.post.writerId).filter((id): id is string => Boolean(id)))]
    const found = writerIds.length ? await db.select().from(writers).where(inArray(writers.id, writerIds)) : []
    rows.forEach((row, index) => {
      const writer = found.find(w => w.id === row.post.writerId)
      result[index]!.writer = writer
        ? {
            id: 0,
            name: writer.name,
            avatar: null,
            twitter: writer.twitter,
            personalUrl: writer.personalUrl,
            createdAt: writer.createdAt.toISOString(),
            updatedAt: writer.updatedAt.toISOString(),
          }
        : null
    })
  }

  return result
}

interface GetLatestPostsParams {
  locale?: AppLocales
  category?: string
  limit?: number
  populate?: string[]
}

/** Same contract as the Strapi `getLatestPosts`: newest first, each locale capped at `limit`. */
export async function getLatestPostsFromDb({ category, limit, locale, populate }: GetLatestPostsParams) {
  const relations = (populate ?? ['categories', 'coverImage', 'localizations']) as Relation[]
  const perLocale = await Promise.all(
    LOCALES.map(lng =>
      selectRows(
        and(eq(postTranslations.locale, lng), category ? inCategory(category) : undefined),
        [desc(postTranslations.publishedAt)],
        limit || 100,
      ),
    ),
  )
  const posts = (await hydrate(perLocale.flat(), relations)).sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  )
  return locale ? getLocalizedPosts(posts, locale) : posts
}

/**
 * Same contract as the Strapi `getAllPosts`, without its 100-row cap, which kept seven Spanish
 * posts out of the archive and the sitemaps.
 */
export async function getAllPostsFromDb({ locale, category }: { locale?: AppLocales; category?: string }) {
  const rows = await selectRows(category ? inCategory(category) : undefined, [desc(postTranslations.updatedAt)])
  const posts = await hydrate(rows, ['localizations', 'coverImage'])
  return locale ? getLocalizedPosts(posts, locale) : posts
}

/** Same contract as the Strapi `getPostById`: a published translation by its public number. */
export async function getPostByIdFromDb({ id }: { id: number }): Promise<Post | undefined> {
  const rows = await selectRows(eq(postTranslations.number, id), [], 1)
  const [post] = await hydrate(rows, ['categories', 'coverImage', 'localizations', 'writer'])
  return post
}

/**
 * The header's quick search, which Algolia used to serve: title and summary, accent- and
 * case-insensitive, in every locale like the old index.
 */
export async function searchPostsFromDb({ query }: { query: string }): Promise<Post[]> {
  const term = query.trim()
  if (!term) {
    return []
  }
  const pattern = `%${term.replace(/[\\%_]/g, char => `\\${char}`)}%`
  const matches = sql`(unaccent(${postTranslations.title}) ilike unaccent(${pattern}) or unaccent(${postTranslations.summary}) ilike unaccent(${pattern}))`
  const rows = await selectRows(matches, [desc(postTranslations.publishedAt)], 20)
  return hydrate(rows, ['categories', 'coverImage'])
}
