import { and, asc, eq, ne } from 'drizzle-orm'

import { getDb } from '../../client'
import { users, writers } from '../../schema'

export interface AdminUser {
  id: string
  name: string
  email: string
  active: boolean
  writerName: string | null
}

export async function listUsersForAdmin(): Promise<AdminUser[]> {
  return getDb()
    .select({ id: users.id, name: users.name, email: users.email, active: users.active, writerName: writers.name })
    .from(users)
    .leftJoin(writers, eq(writers.userId, users.id))
    .orderBy(asc(users.name))
}

export async function getUserForAdmin(id: string) {
  return (await listUsersForAdmin()).find(user => user.id === id)
}

export async function isEmailTaken(email: string, exceptId?: string) {
  const [existing] = await getDb()
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.email, email), exceptId ? ne(users.id, exceptId) : undefined))
  return Boolean(existing)
}

export async function createUser(input: { name: string; email: string; passwordHash: string }) {
  const [created] = await getDb().insert(users).values(input).returning({ id: users.id })
  return created!.id
}

/** `passwordHash` only when the password changes. Returns false when the user does not exist. */
export async function updateUser(
  id: string,
  input: { name: string; email: string; active: boolean; passwordHash?: string },
) {
  const updated = await getDb().update(users).set(input).where(eq(users.id, id)).returning({ id: users.id })
  return updated.length > 0
}

/** Who hears about new comments: everyone who can sign in to the panel. */
export async function listActiveUserEmails() {
  const rows = await getDb().select({ email: users.email }).from(users).where(eq(users.active, true))
  return rows.map(row => row.email)
}
