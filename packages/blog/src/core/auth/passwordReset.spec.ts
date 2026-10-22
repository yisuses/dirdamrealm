import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { passwordResetTokens, users } from '@blog/db/schema'
import { type TestDb, createTestDb } from '@blog/test/db'

import { createPasswordResetToken, resetPassword } from './passwordReset'
import { hashPassword } from './passwords'

const testDb = vi.hoisted(() => ({ current: undefined as unknown as TestDb }))
vi.mock('@blog/db/client', () => ({ getDb: () => testDb.current.db }))

describe('password reset', () => {
  let userId: string

  beforeAll(async () => {
    testDb.current = await createTestDb()
    const [user] = await testDb.current.db
      .insert(users)
      .values({ email: 'ana@example.com', name: 'Ana', passwordHash: 'old' })
      .returning()
    userId = user!.id
  })

  afterAll(async () => {
    await testDb.current.client.close()
  })

  const currentHash = async () =>
    (await testDb.current.db.select().from(users).where(eq(users.id, userId)))[0]!.passwordHash

  it('should store only a hash of a random, url-safe token valid for an hour', async () => {
    const token = await createPasswordResetToken(userId)
    const [row] = await testDb.current.db.select().from(passwordResetTokens)

    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/)
    expect(row!.tokenHash).not.toContain(token)
    expect(row!.tokenHash).toMatch(/^[0-9a-f]{64}$/)
    expect(row!.expiresAt.getTime() - Date.now()).toBeGreaterThan(59 * 60 * 1000)
  })

  it('should set the new password once and spend every pending token of the user', async () => {
    const first = await createPasswordResetToken(userId)
    const second = await createPasswordResetToken(userId)

    await expect(resetPassword(first, 'new-hash')).resolves.toBe(true)
    await expect(currentHash()).resolves.toBe('new-hash')
    await expect(resetPassword(first, 'again')).resolves.toBe(false)
    await expect(resetPassword(second, 'again')).resolves.toBe(false)
  })

  it('should refuse unknown, expired and deactivated users tokens', async () => {
    await expect(resetPassword('unknown', 'x')).resolves.toBe(false)

    const expired = await createPasswordResetToken(userId)
    await testDb.current.client.query(`update password_reset_tokens set expires_at = now() - interval '1 minute'`)
    await expect(resetPassword(expired, 'x')).resolves.toBe(false)

    const pending = await createPasswordResetToken(userId)
    await testDb.current.db.update(users).set({ active: false }).where(eq(users.id, userId))
    await expect(resetPassword(pending, 'x')).resolves.toBe(false)
    await expect(currentHash()).resolves.toBe('new-hash')
  })

  it('should hash passwords with bcrypt', async () => {
    const hashed = await hashPassword('clave-larga-1')

    expect(hashed).toMatch(/^\$2[ab]\$12\$/)
    await expect(bcrypt.compare('clave-larga-1', hashed)).resolves.toBe(true)
  })
})
