import { attachDatabasePool } from '@vercel/functions'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// eslint-disable-next-line @typescript-eslint/naming-convention
vi.mock('pg', () => ({ Pool: vi.fn(function Pool() {}) }))
vi.mock('drizzle-orm/node-postgres', () => ({ drizzle: vi.fn(() => ({ kind: 'db' })) }))
vi.mock('@vercel/functions', () => ({ attachDatabasePool: vi.fn() }))

async function loadClient() {
  // A fresh module per test, so the memoized client from a previous test does not leak.
  vi.resetModules()
  return import('./client')
}

describe('getDb', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('DATABASE_URL', 'postgres://user:pass@host/db')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('should not open a pool when the module is imported', async () => {
    await loadClient()

    expect(Pool).not.toHaveBeenCalled()
  })

  it('should create the client once, with the pool attached for Fluid compute', async () => {
    const { getDb } = await loadClient()

    const db = getDb()

    expect(getDb()).toBe(db)
    expect(Pool).toHaveBeenCalledTimes(1)
    expect(Pool).toHaveBeenCalledWith({ connectionString: 'postgres://user:pass@host/db' })
    expect(attachDatabasePool).toHaveBeenCalledWith(vi.mocked(Pool).mock.instances[0])
    expect(drizzle).toHaveBeenCalledWith(expect.objectContaining({ client: vi.mocked(Pool).mock.instances[0] }))
  })

  it('should fail clearly when DATABASE_URL is missing', async () => {
    vi.stubEnv('DATABASE_URL', '')
    const { getDb } = await loadClient()

    expect(() => getDb()).toThrow('DATABASE_URL is not set')
    expect(Pool).not.toHaveBeenCalled()
  })
})
