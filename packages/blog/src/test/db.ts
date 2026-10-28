import { PGlite } from '@electric-sql/pglite'
import { unaccent } from '@electric-sql/pglite/contrib/unaccent'
import { drizzle } from 'drizzle-orm/pglite'
import { migrate } from 'drizzle-orm/pglite/migrator'
import path from 'node:path'

import type { Db } from '@blog/db/client'
import * as schema from '@blog/db/schema'

/**
 * A real Postgres running in-process (PGlite) with the app's own migrations applied, so query
 * tests exercise the actual SQL instead of a mocked query builder.
 *
 * Use with `vi.mock('@blog/db/client', () => ({ getDb: () => testDb.db }))`.
 */
export async function createTestDb() {
  const client = new PGlite({ extensions: { unaccent } })
  const db = drizzle({ client, schema })
  await migrate(db, { migrationsFolder: path.resolve(import.meta.dirname, '../db/migrations') })
  // Same query-builder API as the node-postgres client the app uses.
  return { db: db as unknown as Db, client }
}

export type TestDb = Awaited<ReturnType<typeof createTestDb>>
