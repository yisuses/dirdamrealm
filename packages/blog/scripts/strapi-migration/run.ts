/**
 * Copies Strapi's production data into the Neon database. Idempotent: it empties the target
 * tables and rewrites them in one transaction, so it can be re-run until the cutover.
 *
 * The source credentials come from the Railway CLI, the target from `.env.local`:
 *
 *   railway run --service Postgres-prod -- yarn db:migrate-strapi [--dry-run]
 *
 * `--dry-run` reads and transforms everything and prints the report without writing.
 */
import { sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/node-postgres'
import { readFileSync } from 'node:fs'
import { parseEnv } from 'node:util'
import { Client, Pool, types } from 'pg'

import * as schema from '../../src/db/schema'
import { type StrapiData, buildMigration, parseStrapiTimestamp } from './transform'

function sourceConnectionString() {
  // `railway run` injects the database's own variables; the public TCP proxy is what is
  // reachable from outside Railway.
  // eslint-disable-next-line @typescript-eslint/naming-convention -- environment variable names
  const { PGUSER, PGPASSWORD, PGDATABASE, RAILWAY_TCP_PROXY_DOMAIN, RAILWAY_TCP_PROXY_PORT } = process.env
  if (!PGUSER || !PGPASSWORD || !PGDATABASE || !RAILWAY_TCP_PROXY_DOMAIN || !RAILWAY_TCP_PROXY_PORT) {
    throw new Error('Run through `railway run --service Postgres-prod -- …` to get the Strapi database credentials')
  }
  const auth = `${encodeURIComponent(PGUSER)}:${encodeURIComponent(PGPASSWORD)}`
  return `postgresql://${auth}@${RAILWAY_TCP_PROXY_DOMAIN}:${RAILWAY_TCP_PROXY_PORT}/${PGDATABASE}?sslmode=no-verify`
}

function targetConnectionString() {
  // Read explicitly instead of from process.env: `railway run` also injects a DATABASE_URL,
  // which points at Railway, not Neon.
  const env = parseEnv(readFileSync('.env.local', 'utf8'))
  const url = env.DATABASE_URL_UNPOOLED
  if (!url) {
    throw new Error('DATABASE_URL_UNPOOLED is missing from .env.local')
  }
  return url
}

async function readStrapi(client: Client): Promise<StrapiData> {
  const rows = async <T>(query: string) => (await client.query(query)).rows as T[]
  const [about] = await rows<StrapiData['about']>(
    'select display, name, email, description, twitter, twitter_url, facebook, facebook_url, instagram, instagram_url, linkedin, linkedin_url from abouts order by published_at nulls last limit 1',
  )
  return {
    adminUsers: await rows('select id, firstname, lastname, email, password, is_active, blocked from admin_users'),
    writers: await rows('select id, document_id, name, twitter, personal_url from writers order by id'),
    categories: await rows(
      'select id, document_id, code, name, description, main, translations, created_at, updated_at from categories order by published_at nulls last, id',
    ),
    posts: await rows(
      'select id, document_id, locale, title, summary, content, img_url, cover_image_author, cover_image_source_url, published_at, created_at, updated_at from posts order by id',
    ),
    files: await rows('select id, width, height, alternative_text, caption, provider_metadata from files'),
    comments: await rows('select id, author, text, created_at from comments order by id'),
    about: about ?? null,
    postWriters: await rows('select post_id, writer_id from posts_writer_lnk'),
    postCategories: await rows('select post_id, category_id from posts_categories_lnk'),
    postCovers: await rows(
      "select related_id, file_id from files_related_mph where related_type = 'api::post.post' and field = 'coverImage'",
    ),
    commentPosts: await rows('select comment_id, post_id from comments_post_lnk order by id'),
  }
}

async function main() {
  types.setTypeParser(types.builtins.TIMESTAMP, parseStrapiTimestamp)
  const dryRun = process.argv.includes('--dry-run')

  const source = new Client({ connectionString: sourceConnectionString() })
  // node-postgres fills whatever a connection string omits (Neon's has no port) from the PG*
  // variables, which `railway run` sets for Railway. Clear them before connecting to Neon.
  for (const name of ['PGHOST', 'PGPORT', 'PGUSER', 'PGPASSWORD', 'PGDATABASE']) {
    delete process.env[name]
  }
  await source.connect()
  const data = await readStrapi(source)
  await source.end()

  const { rows, report } = buildMigration(data)
  console.log(JSON.stringify(report, null, 2))

  if (dryRun) {
    console.log('Dry run: nothing written.')
    return
  }

  const pool = new Pool({ connectionString: targetConnectionString() })
  const db = drizzle({ client: pool, schema })
  await db.transaction(async tx => {
    await tx.execute(
      sql`truncate table comments, post_categories, post_translations, posts, category_translations, categories, writers, users, social_links, site_contact_translations, site_contact restart identity`,
    )
    if (rows.users.length) await tx.insert(schema.users).values(rows.users)
    if (rows.writers.length) await tx.insert(schema.writers).values(rows.writers)
    if (rows.categories.length) await tx.insert(schema.categories).values(rows.categories)
    if (rows.categoryTranslations.length) await tx.insert(schema.categoryTranslations).values(rows.categoryTranslations)
    if (rows.posts.length) await tx.insert(schema.posts).values(rows.posts)
    if (rows.postTranslations.length) await tx.insert(schema.postTranslations).values(rows.postTranslations)
    if (rows.postCategories.length) await tx.insert(schema.postCategories).values(rows.postCategories)
    if (rows.comments.length) await tx.insert(schema.comments).values(rows.comments)
    if (rows.siteContact) await tx.insert(schema.siteContact).values(rows.siteContact)
    await tx.insert(schema.siteContactTranslations).values(rows.siteContactTranslations)
    if (rows.socialLinks.length) await tx.insert(schema.socialLinks).values(rows.socialLinks)

    // New posts and comments must get numbers and ids past the ones kept from Strapi.
    await tx.execute(sql`select setval('post_number_seq', greatest((select max(number) from post_translations), 1))`)
    await tx.execute(
      sql`select setval(pg_get_serial_sequence('comments', 'id'), greatest((select max(id) from comments), 1))`,
    )
  })

  const counts = await db.execute(sql`
    select (select count(*) from users) users, (select count(*) from writers) writers,
      (select count(*) from categories) categories, (select count(*) from posts) posts,
      (select count(*) from post_translations) translations,
      (select count(*) from post_translations where status = 'published') published,
      (select count(*) from comments) comments, (select count(*) from social_links) social_links`)
  console.log('Written to Neon:', counts.rows[0])
  await pool.end()
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
