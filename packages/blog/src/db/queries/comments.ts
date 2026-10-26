import { and, asc, desc, eq, inArray, isNull } from 'drizzle-orm'

import { getDb } from '../client'
import { comments, postTranslations, posts, users, writers } from '../schema'

/** Same contract as the Strapi `getComments`: the comments of the given post numbers, newest first. */
export async function getCommentsFromDb({ ids = [] }: { ids?: number[] }): Promise<Commentary[]> {
  if (ids.length === 0) {
    return []
  }
  const rows = await getDb()
    .select()
    .from(comments)
    .where(inArray(comments.postNumber, ids))
    .orderBy(desc(comments.createdAt))

  return rows.map(row => ({
    id: row.id,
    author: row.author,
    text: row.text,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.createdAt.toISOString(),
  }))
}

/** A published translation, as its page's url needs it. */
export interface CommentedPost {
  number: number
  locale: 'es' | 'en'
  title: string
}

/**
 * The published translations of the post a translation belongs to: each of their pages shows the
 * comments of all of them, so all are refreshed when one gets a comment.
 */
export async function getPublishedSiblings(postNumber: number): Promise<CommentedPost[]> {
  const db = getDb()
  const [translation] = await db
    .select({ postId: postTranslations.postId })
    .from(postTranslations)
    .innerJoin(posts, eq(posts.id, postTranslations.postId))
    .where(and(eq(postTranslations.number, postNumber), isNull(posts.deletedAt)))
  if (!translation) {
    return []
  }
  return db
    .select({ number: postTranslations.number, locale: postTranslations.locale, title: postTranslations.title })
    .from(postTranslations)
    .where(and(eq(postTranslations.postId, translation.postId), eq(postTranslations.status, 'published')))
    .orderBy(asc(postTranslations.locale))
}

/** Saves a visitor's comment on a published post; undefined when there is no such post. */
export async function createCommentInDb({
  postNumber,
  author,
  text,
}: {
  postNumber: number
  author: string
  text: string
}) {
  const pages = await getPublishedSiblings(postNumber)
  const post = pages.find(page => page.number === postNumber)
  if (!post) {
    return undefined
  }
  const [comment] = await getDb().insert(comments).values({ postNumber, author, text }).returning({ id: comments.id })
  return { id: comment!.id, post, pages }
}

/**
 * The email of a post's author: the panel user linked to the post's signature, if still active.
 * Undefined when the post has no signature, or its signature no active user.
 */
export async function getPostAuthorEmail(postNumber: number): Promise<string | undefined> {
  const [row] = await getDb()
    .select({ email: users.email })
    .from(postTranslations)
    .innerJoin(posts, eq(posts.id, postTranslations.postId))
    .innerJoin(writers, eq(writers.id, posts.writerId))
    .innerJoin(users, eq(users.id, writers.userId))
    .where(and(eq(postTranslations.number, postNumber), eq(users.active, true)))
  return row?.email
}
