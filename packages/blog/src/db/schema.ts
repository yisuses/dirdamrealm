import { sql } from 'drizzle-orm'
import {
  boolean,
  check,
  date,
  integer,
  jsonb,
  pgEnum,
  pgSequence,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'
import type { DataProp } from 'editorjs-blocks-react-renderer'

/**
 * Schema of the content that used to live in Strapi. See docs/strapi-to-vercel-migration.md §4.
 *
 * Shared data lives in a parent table and per-language data in a `*_translations` table keyed by
 * `(parent, locale)`, as in portfolio-blog. Unlike there, each language of a post has its own
 * public number (`/post/337/…`, `/en/post/338/…`), so the number lives on the translation.
 */

export const localeEnum = pgEnum('locale', ['es', 'en'])
export const postStatusEnum = pgEnum('post_status', ['draft', 'published', 'archived'])

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
}

/** A Cloudinary image as stored on a post. Variants are built from `publicId` with URL transformations. */
export interface StoredImage {
  publicId: string
  width: number
  height: number
  alt?: string
  caption?: string
  focus?: ImageFocus
  fit?: ImageFit
}

/** Edits of a published translation's text, applied to the public columns on publish. */
export interface TranslationDraft {
  title: string
  summary: string
  content: DataProp
  savedAt: string
}

/** Edits of what both languages share, while the post is on the site, applied on publish. */
export interface PostDraft {
  cover: StoredImage | null
  coverImageAuthor: string
  coverImageSourceUrl: string
  writerId: string
  // In order: the first is the post's main category.
  categoryIds: string[]
  savedAt: string
}

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  passwordHash: text('password_hash').notNull(),
  active: boolean('active').notNull().default(true),
  ...timestamps,
})

/** One-time password reset links. Only a hash of the token is stored, never the token itself. */
export const passwordResetTokens = pgTable('password_reset_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: text('token_hash').notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  usedAt: timestamp('used_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const writers = pgTable('writers', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .unique()
    .references(() => users.id, { onDelete: 'set null' }),
  name: text('name').notNull().unique(),
  twitter: text('twitter'),
  personalUrl: text('personal_url'),
  ...timestamps,
})

export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  writerId: uuid('writer_id').references(() => writers.id, { onDelete: 'set null' }),
  cover: jsonb('cover').$type<StoredImage>(),
  coverImageAuthor: text('cover_image_author'),
  coverImageSourceUrl: text('cover_image_source_url'),
  imgUrl: text('img_url'),
  draft: jsonb('draft').$type<PostDraft>(),
  ...timestamps,
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
})

// Public numbers keep the ids Strapi used in urls; the migration sets this past the highest one.
export const postNumberSequence = pgSequence('post_number_seq')

export const postTranslations = pgTable(
  'post_translations',
  {
    postId: uuid('post_id')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    locale: localeEnum('locale').notNull(),
    number: integer('number')
      .notNull()
      .unique()
      .default(sql`nextval('post_number_seq')`),
    // The public version while published; the working copy while still a draft.
    title: text('title').notNull(),
    summary: text('summary').notNull(),
    content: jsonb('content').$type<DataProp>().notNull(),
    status: postStatusEnum('status').notNull().default('draft'),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    // A day, not a time: a daily cron publishes everything due that morning.
    scheduledFor: date('scheduled_for'),
    draft: jsonb('draft').$type<TranslationDraft>(),
    previewToken: uuid('preview_token').notNull().unique().defaultRandom(),
    ...timestamps,
  },
  table => [
    primaryKey({ columns: [table.postId, table.locale] }),
    check(
      'post_translations_published_has_date',
      sql`${table.status} <> 'published' or ${table.publishedAt} is not null`,
    ),
  ],
)

export const categories = pgTable(
  'categories',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    code: text('code').notNull().unique(),
    main: boolean('main').notNull().default(false),
    ...timestamps,
  },
  // Codes are url segments the proxy only lets through when they match this shape.
  table => [check('categories_code_format', sql`${table.code} ~ '^[A-Z]{1,16}$'`)],
)

export const categoryTranslations = pgTable(
  'category_translations',
  {
    categoryId: uuid('category_id')
      .notNull()
      .references(() => categories.id, { onDelete: 'cascade' }),
    locale: localeEnum('locale').notNull(),
    name: text('name').notNull(),
    description: text('description').notNull().default(''),
  },
  table => [primaryKey({ columns: [table.categoryId, table.locale] })],
)

export const postCategories = pgTable(
  'post_categories',
  {
    postId: uuid('post_id')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    categoryId: uuid('category_id')
      .notNull()
      .references(() => categories.id, { onDelete: 'cascade' }),
    // Order in which the categories were assigned; the cards show them in this order.
    position: integer('position').notNull().default(0),
  },
  table => [primaryKey({ columns: [table.postId, table.categoryId] })],
)

export const comments = pgTable('comments', {
  // Identity "by default" so the migration can keep Strapi's ids, which appear in `#comment-<id>` links.
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
  postNumber: integer('post_number')
    .notNull()
    .references(() => postTranslations.number, { onDelete: 'cascade' }),
  author: text('author').notNull(),
  text: text('text').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const siteContact = pgTable(
  'site_contact',
  {
    id: integer('id').primaryKey().default(1),
    display: boolean('display').notNull().default(true),
    name: text('name'),
    email: text('email'),
    updatedAt: timestamps.updatedAt,
  },
  // A single row: the site has one contact block.
  table => [check('site_contact_single_row', sql`${table.id} = 1`)],
)

export const siteContactTranslations = pgTable('site_contact_translations', {
  locale: localeEnum('locale').primaryKey(),
  description: text('description').notNull().default(''),
})

export const socialLinks = pgTable('social_links', {
  id: uuid('id').primaryKey().defaultRandom(),
  network: text('network').notNull(),
  handle: text('handle'),
  url: text('url').notNull(),
  position: integer('position').notNull().default(0),
  visible: boolean('visible').notNull().default(true),
  ...timestamps,
})
