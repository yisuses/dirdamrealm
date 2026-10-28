import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { posts, users } from '@blog/db/schema'
import { type TestDb, createTestDb } from '@blog/test/db'

import {
  createWriter,
  deleteWriter,
  findWriterConflict,
  getWriterForAdmin,
  listUserOptions,
  listWritersForAdmin,
  updateWriter,
} from './writers'

const testDb = vi.hoisted(() => ({ current: undefined as unknown as TestDb }))
vi.mock('@blog/db/client', () => ({ getDb: () => testDb.current.db }))

const missing = '00000000-0000-0000-0000-000000000000'

describe('admin writer queries', () => {
  let joseId: string

  beforeAll(async () => {
    testDb.current = await createTestDb()
    const [jose] = await testDb.current.db
      .insert(users)
      .values([
        { email: 'jose@example.com', name: 'José', passwordHash: 'h' },
        { email: 'ana@example.com', name: 'Ana', passwordHash: 'h' },
      ])
      .returning()
    joseId = jose!.id
  })

  afterAll(async () => {
    await testDb.current.client.close()
  })

  it('should create a writer linked to a user and list it with its user and post count', async () => {
    const id = await createWriter({ name: 'José Madrid', twitter: '@jose', personalUrl: '', userId: joseId })
    await testDb.current.db.insert(posts).values({ writerId: id })

    await expect(listWritersForAdmin()).resolves.toEqual([
      { id, name: 'José Madrid', twitter: '@jose', personalUrl: '', userId: joseId, userName: 'José', posts: 1 },
    ])
  })

  it('should offer every user, alphabetically', async () => {
    await expect(listUserOptions().then(list => list.map(u => u.name))).resolves.toEqual(['Ana', 'José'])
  })

  it('should find name and user conflicts with other writers only', async () => {
    const [writer] = await listWritersForAdmin()
    const input = { name: 'José Madrid', twitter: '', personalUrl: '', userId: '' }

    await expect(findWriterConflict(input)).resolves.toBe('Ya hay un autor con ese nombre')
    await expect(findWriterConflict(input, writer!.id)).resolves.toBeNull()
    await expect(findWriterConflict({ ...input, name: 'Otro', userId: joseId })).resolves.toBe(
      'Ese usuario ya tiene una ficha de autor',
    )
    await expect(findWriterConflict({ ...input, name: 'Otro', userId: joseId }, writer!.id)).resolves.toBeNull()
  })

  it('should update a writer, storing empty texts as missing, and report unknown ones', async () => {
    const [writer] = await listWritersForAdmin()

    await expect(
      updateWriter(writer!.id, { name: 'J. Madrid', twitter: '', personalUrl: 'https://j.es', userId: '' }),
    ).resolves.toBe(true)
    await expect(getWriterForAdmin(writer!.id)).resolves.toMatchObject({
      name: 'J. Madrid',
      twitter: '',
      userName: null,
    })
    await expect(updateWriter(missing, { name: 'x', twitter: '', personalUrl: '', userId: '' })).resolves.toBe(false)
  })

  it('should delete a writer, leaving its posts without one', async () => {
    const [writer] = await listWritersForAdmin()

    await expect(deleteWriter(writer!.id)).resolves.toBe(true)
    await expect(deleteWriter(missing)).resolves.toBe(false)
    await expect(testDb.current.db.select({ writerId: posts.writerId }).from(posts)).resolves.toEqual([
      { writerId: null },
    ])
  })

  it('should count no posts for a writer who signs none', async () => {
    await createWriter({ name: 'Ana', twitter: '', personalUrl: '', userId: '' })

    await expect(listWritersForAdmin()).resolves.toMatchObject([{ name: 'Ana', posts: 0, userName: null }])
  })
})
