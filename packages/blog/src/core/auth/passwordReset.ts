import { and, eq, gt, isNull } from 'drizzle-orm'
import { createHash, randomBytes } from 'node:crypto'

import { getDb } from '@blog/db/client'
import { passwordResetTokens, users } from '@blog/db/schema'

const validityMs = 60 * 60 * 1000

const hash = (token: string) => createHash('sha256').update(token).digest('hex')

/** A new single-use token for this user, valid for an hour. Only its hash is stored. */
export async function createPasswordResetToken(userId: string) {
  const token = randomBytes(32).toString('base64url')
  await getDb()
    .insert(passwordResetTokens)
    .values({ userId, tokenHash: hash(token), expiresAt: new Date(Date.now() + validityMs) })
  return token
}

/**
 * Sets the new password if the token is valid (unused, unexpired, active user), and spends it and
 * every other pending token of that user. Returns whether it worked.
 */
export async function resetPassword(token: string, passwordHash: string) {
  return getDb().transaction(async tx => {
    const [found] = await tx
      .select({ userId: passwordResetTokens.userId })
      .from(passwordResetTokens)
      .innerJoin(users, eq(users.id, passwordResetTokens.userId))
      .where(
        and(
          eq(passwordResetTokens.tokenHash, hash(token)),
          isNull(passwordResetTokens.usedAt),
          gt(passwordResetTokens.expiresAt, new Date()),
          eq(users.active, true),
        ),
      )
    if (!found) {
      return false
    }
    await tx.update(users).set({ passwordHash }).where(eq(users.id, found.userId))
    await tx
      .update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(and(eq(passwordResetTokens.userId, found.userId), isNull(passwordResetTokens.usedAt)))
    return true
  })
}
