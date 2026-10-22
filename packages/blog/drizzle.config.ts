import { defineConfig } from 'drizzle-kit'
import { existsSync } from 'node:fs'

// drizzle-kit does not load Next's env files; `vercel env pull` writes the connection strings here.
if (existsSync('.env.local')) {
  process.loadEnvFile('.env.local')
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  // Migrations need the direct (unpooled) connection: Neon's pooler does not support all DDL.
  dbCredentials: { url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? '' },
  strict: true,
  verbose: true,
})
