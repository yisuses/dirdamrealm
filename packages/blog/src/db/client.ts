import { attachDatabasePool } from '@vercel/functions'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import * as schema from './schema'

function createDb() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set')
  }

  const pool = new Pool({ connectionString })
  // Lets Vercel Fluid compute close idle connections before suspending the function, as Neon
  // recommends for node-postgres on Vercel.
  attachDatabasePool(pool)
  return drizzle({ client: pool, schema })
}

export type Db = ReturnType<typeof createDb>

let db: Db | undefined

/**
 * The database client, created on first use. Importing this module must not open a pool:
 * `next build` evaluates modules without `DATABASE_URL` in some environments.
 */
export function getDb(): Db {
  db ??= createDb()
  return db
}
