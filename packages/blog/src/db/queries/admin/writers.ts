import { and, asc, count, eq, ne } from 'drizzle-orm'

import type { WriterInput } from '@blog/core/validation/writer'

import { getDb } from '../../client'
import { posts, users, writers } from '../../schema'

export interface AdminWriter extends WriterInput {
  id: string
  userName: string | null
  posts: number
}

export async function listWritersForAdmin(): Promise<AdminWriter[]> {
  const db = getDb()
  const rows = await db
    .select({ writer: writers, userName: users.name })
    .from(writers)
    .leftJoin(users, eq(users.id, writers.userId))
    .orderBy(asc(writers.name))
  const usage = await db.select({ writerId: posts.writerId, posts: count() }).from(posts).groupBy(posts.writerId)

  return rows.map(({ writer, userName }) => ({
    id: writer.id,
    name: writer.name,
    twitter: writer.twitter ?? '',
    personalUrl: writer.personalUrl ?? '',
    userId: writer.userId ?? '',
    userName,
    posts: usage.find(u => u.writerId === writer.id)?.posts ?? 0,
  }))
}

export async function getWriterForAdmin(id: string) {
  return (await listWritersForAdmin()).find(writer => writer.id === id)
}

/** The users a card can be linked to. */
export async function listUserOptions() {
  return getDb().select({ id: users.id, name: users.name }).from(users).orderBy(asc(users.name))
}

/** Which of the unique fields (name, user) another writer already uses, if any. */
export async function findWriterConflict(input: WriterInput, exceptId?: string) {
  const db = getDb()
  const others = exceptId ? ne(writers.id, exceptId) : undefined
  const [sameName] = await db
    .select({ id: writers.id })
    .from(writers)
    .where(and(eq(writers.name, input.name), others))
  if (sameName) {
    return 'Ya hay un autor con ese nombre'
  }
  if (input.userId) {
    const [sameUser] = await db
      .select({ id: writers.id })
      .from(writers)
      .where(and(eq(writers.userId, input.userId), others))
    if (sameUser) {
      return 'Ese usuario ya tiene una ficha de autor'
    }
  }
  return null
}

const columns = (input: WriterInput) => ({
  name: input.name,
  twitter: input.twitter || null,
  personalUrl: input.personalUrl || null,
  userId: input.userId || null,
})

export async function createWriter(input: WriterInput) {
  const [created] = await getDb().insert(writers).values(columns(input)).returning({ id: writers.id })
  return created!.id
}

export async function updateWriter(id: string, input: WriterInput) {
  const updated = await getDb()
    .update(writers)
    .set(columns(input))
    .where(eq(writers.id, id))
    .returning({ id: writers.id })
  return updated.length > 0
}

/** Its posts stay, without a writer. */
export async function deleteWriter(id: string) {
  const deleted = await getDb().delete(writers).where(eq(writers.id, id)).returning({ id: writers.id })
  return deleted.length > 0
}
