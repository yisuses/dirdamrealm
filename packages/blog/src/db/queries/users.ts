import { and, eq } from 'drizzle-orm'

import { getDb } from '../client'
import { users } from '../schema'

/** The active user with this email, matched case-insensitively. */
export async function getActiveUserByEmail(email: string) {
  const [user] = await getDb()
    .select()
    .from(users)
    .where(and(eq(users.email, email.trim().toLowerCase()), eq(users.active, true)))
  return user
}
