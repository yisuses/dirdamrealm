/**
 * Runs before `next build`. On Vercel previews, the Neon integration gives each git branch its
 * own copy of the database, made when the branch was first deployed: this brings its schema up
 * to date so the build (which reads the database) and the preview work. Production and local
 * builds are left alone: there, migrations are applied on purpose with `yarn db:migrate`.
 */
import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { Pool } from 'pg'

async function main() {
  if (process.env.VERCEL_ENV !== 'preview') {
    return
  }
  const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL is not set for this preview')
  }
  const pool = new Pool({ connectionString: url })
  try {
    await migrate(drizzle(pool), { migrationsFolder: 'src/db/migrations' })
    console.log('Preview database schema is up to date')
  } finally {
    await pool.end()
  }
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
