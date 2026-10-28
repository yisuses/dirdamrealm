import { and, asc, eq, isNull, or, sql } from 'drizzle-orm'

import { getDb } from '../../client'
import { postTranslations, posts } from '../../schema'

/** A translation that shows an image, and where: as the post's cover or inside the text. */
export interface ImageUsage {
  number: number
  locale: 'es' | 'en'
  title: string
  status: 'draft' | 'published' | 'archived'
  cover: boolean
  content: boolean
}

/**
 * The translations of non-deleted posts that use an image, so it is not deleted from under them.
 * Covers count whether published or waiting in the post's draft. Content blocks (published or
 * unpublished edits) hold the image's url, `…/<publicId>.<ext>`, or
 * its id as a whole JSON string; Strapi's resized copies (`small_<publicId>`) match neither.
 */
export async function findImageUsage(publicId: string): Promise<ImageUsage[]> {
  const inUrl = `/${publicId}.`
  const asString = JSON.stringify(publicId)
  const mentions = (column: unknown) =>
    sql<boolean>`(strpos(coalesce(${column}::text, ''), ${inUrl}) > 0 or strpos(coalesce(${column}::text, ''), ${asString}) > 0)`

  const cover = sql<boolean>`(${posts.cover}->>'publicId' = ${publicId} or ${posts.draft}->'cover'->>'publicId' = ${publicId} or strpos(coalesce(${posts.imgUrl}, ''), ${inUrl}) > 0)`
  const content = sql<boolean>`(${mentions(postTranslations.content)} or ${mentions(postTranslations.draft)})`

  return getDb()
    .select({
      number: postTranslations.number,
      locale: postTranslations.locale,
      title: postTranslations.title,
      status: postTranslations.status,
      cover,
      content,
    })
    .from(postTranslations)
    .innerJoin(posts, eq(posts.id, postTranslations.postId))
    .where(and(isNull(posts.deletedAt), or(cover, content)))
    .orderBy(asc(postTranslations.number))
}
