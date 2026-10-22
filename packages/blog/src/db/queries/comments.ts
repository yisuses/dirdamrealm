import { desc, inArray } from 'drizzle-orm'

import { getDb } from '../client'
import { comments } from '../schema'

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
