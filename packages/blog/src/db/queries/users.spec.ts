import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { users } from '@blog/db/schema'
import { type TestDb, createTestDb } from '@blog/test/db'

import { getActiveUserByEmail } from './users'

const testDb = vi.hoisted(() => ({ current: undefined as unknown as TestDb }))
vi.mock('@blog/db/client', () => ({ getDb: () => testDb.current.db }))

describe('getActiveUserByEmail', () => {
  beforeAll(async () => {
    testDb.current = await createTestDb()
    await testDb.current.db.insert(users).values([
      { email: 'jose@example.com', name: 'José', passwordHash: 'h1' },
      { email: 'old@example.com', name: 'Old', passwordHash: 'h2', active: false },
    ])
  })

  afterAll(async () => {
    await testDb.current.client.close()
  })

  it('should find an active user ignoring case and surrounding spaces', async () => {
    await expect(getActiveUserByEmail('  JOSE@Example.com ')).resolves.toMatchObject({ name: 'José' })
  })

  it('should not return deactivated or unknown users', async () => {
    await expect(getActiveUserByEmail('old@example.com')).resolves.toBeUndefined()
    await expect(getActiveUserByEmail('nobody@example.com')).resolves.toBeUndefined()
  })
})
