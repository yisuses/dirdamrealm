import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { writers } from '@blog/db/schema'
import { type TestDb, createTestDb } from '@blog/test/db'

import { createUser, getUserForAdmin, isEmailTaken, listUsersForAdmin, updateUser } from './users'

const testDb = vi.hoisted(() => ({ current: undefined as unknown as TestDb }))
vi.mock('@blog/db/client', () => ({ getDb: () => testDb.current.db }))

describe('admin user queries', () => {
  beforeAll(async () => {
    testDb.current = await createTestDb()
  })

  afterAll(async () => {
    await testDb.current.client.close()
  })

  it('should create users and list them alphabetically with their writer card', async () => {
    const jose = await createUser({ name: 'José', email: 'jose@example.com', passwordHash: 'h' })
    const ana = await createUser({ name: 'Ana', email: 'ana@example.com', passwordHash: 'h' })
    await testDb.current.db.insert(writers).values({ name: 'José Madrid', userId: jose })

    await expect(listUsersForAdmin()).resolves.toEqual([
      { id: ana, name: 'Ana', email: 'ana@example.com', active: true, writerName: null },
      { id: jose, name: 'José', email: 'jose@example.com', active: true, writerName: 'José Madrid' },
    ])
  })

  it('should say whether an email is taken by someone else', async () => {
    const [ana] = await listUsersForAdmin()

    await expect(isEmailTaken('ana@example.com')).resolves.toBe(true)
    await expect(isEmailTaken('ana@example.com', ana!.id)).resolves.toBe(false)
    await expect(isEmailTaken('nadie@example.com')).resolves.toBe(false)
  })

  it('should update a user, changing the password only when given', async () => {
    const [ana] = await listUsersForAdmin()

    await expect(updateUser(ana!.id, { name: 'Ana M.', email: 'ana@example.com', active: false })).resolves.toBe(true)
    await expect(getUserForAdmin(ana!.id)).resolves.toMatchObject({ name: 'Ana M.', active: false })
    await expect(
      updateUser('00000000-0000-0000-0000-000000000000', { name: 'x', email: 'x@x.x', active: true }),
    ).resolves.toBe(false)
  })
})
