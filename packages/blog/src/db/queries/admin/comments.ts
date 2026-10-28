import { and, count, desc, eq, isNull, or, sql } from 'drizzle-orm'

import { commentListPageSize } from '@blog/core/validation/comment'

import { getDb } from '../../client'
import { comments, postTranslations, posts } from '../../schema'
import { type CommentedPost, getPublishedSiblings } from '../comments'

export interface AdminComment {
  id: number
  author: string
  text: string
  createdAt: string
  post: { id: string; number: number; locale: 'es' | 'en'; title: string; published: boolean }
}

/** Comments of posts that still exist, newest first, optionally matching author or text. */
export async function listCommentsForAdmin({ query, page = 1 }: { query?: string; page?: number }) {
  const db = getDb()
  const term = query?.trim()
  const pattern = term && `%${term.replace(/[\\%_]/g, char => `\\${char}`)}%`
  const where = and(
    isNull(posts.deletedAt),
    pattern
      ? or(
          sql`unaccent(${comments.author}) ilike unaccent(${pattern})`,
          sql`unaccent(${comments.text}) ilike unaccent(${pattern})`,
        )
      : undefined,
  )
  const base = () =>
    db
      .select({
        comment: comments,
        post: {
          id: postTranslations.postId,
          number: postTranslations.number,
          locale: postTranslations.locale,
          title: postTranslations.title,
          status: postTranslations.status,
        },
      })
      .from(comments)
      .innerJoin(postTranslations, eq(postTranslations.number, comments.postNumber))
      .innerJoin(posts, eq(posts.id, postTranslations.postId))
      .where(where)

  const [{ total }] = (await db
    .select({ total: count() })
    .from(comments)
    .innerJoin(postTranslations, eq(postTranslations.number, comments.postNumber))
    .innerJoin(posts, eq(posts.id, postTranslations.postId))
    .where(where)) as [{ total: number }]
  const rows = await base()
    .orderBy(desc(comments.createdAt), desc(comments.id))
    .limit(commentListPageSize)
    .offset((Math.max(page, 1) - 1) * commentListPageSize)

  const list: AdminComment[] = rows.map(({ comment, post }) => ({
    id: comment.id,
    author: comment.author,
    text: comment.text,
    createdAt: comment.createdAt.toISOString(),
    post: {
      id: post.id,
      number: post.number,
      locale: post.locale,
      title: post.title,
      published: post.status === 'published',
    },
  }))
  return { comments: list, total }
}

/** Deletes a comment; returns the post pages that showed it, or undefined if it did not exist. */
export async function deleteComment(id: number): Promise<CommentedPost[] | undefined> {
  const [deleted] = await getDb()
    .delete(comments)
    .where(eq(comments.id, id))
    .returning({ postNumber: comments.postNumber })
  return deleted ? getPublishedSiblings(deleted.postNumber) : undefined
}
