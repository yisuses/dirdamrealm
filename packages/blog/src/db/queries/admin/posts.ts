import { and, asc, count, desc, eq, exists, inArray, isNull, lte, ne, or, sql } from 'drizzle-orm'
import type { DataProp } from 'editorjs-blocks-react-renderer'

import { type PostSaveInput, postListPageSize, publishableSchema } from '@blog/core/validation/post'

import { getDb } from '../../client'
import {
  type PostDraft,
  categories,
  categoryTranslations,
  postCategories,
  postTranslations,
  posts,
  writers,
} from '../../schema'

type Locale = 'es' | 'en'
type Status = 'draft' | 'published' | 'archived'
type Db = ReturnType<typeof getDb>
type Tx = Parameters<Parameters<Db['transaction']>[0]>[0]

export const emptyContent: DataProp = { time: 0, version: '', blocks: [] }

/** What both languages share, as the editor shows and saves it. */
export type PostFields = Omit<PostDraft, 'savedAt'>

/** One language of a post, as the editor works on it: with its unpublished edits applied. */
export interface EditorTranslation {
  locale: Locale
  number: number
  status: Status
  publishedAt: string | null
  scheduledFor: string | null
  previewToken: string
  title: string
  // The title readers see (its url comes from it), or null while unpublished.
  publishedTitle: string | null
  summary: string
  content: DataProp
  // Published, with edits (its own or the post's shared fields) not on the site yet.
  hasUnpublishedChanges: boolean
  savedAt: string
}

export interface EditorPost {
  id: string
  // Some language is published: the shared fields are on the site, so edits to them wait.
  live: boolean
  fields: PostFields
  translations: Partial<Record<Locale, EditorTranslation>>
}

const notDeleted = (postId: string) => and(eq(posts.id, postId), isNull(posts.deletedAt))

async function loadCategoryIds(db: Db | Tx, postId: string) {
  const rows = await db
    .select({ id: postCategories.categoryId })
    .from(postCategories)
    .where(eq(postCategories.postId, postId))
    .orderBy(asc(postCategories.position))
  return rows.map(row => row.id)
}

export async function getPostForEditor(postId: string): Promise<EditorPost | undefined> {
  const db = getDb()
  const [post] = await db.select().from(posts).where(notDeleted(postId))
  if (!post) {
    return undefined
  }
  const rows = await db.select().from(postTranslations).where(eq(postTranslations.postId, postId))
  const live = rows.some(row => row.status === 'published')
  const fields: PostFields = post.draft
    ? fieldsOf(post.draft)
    : {
        cover: post.cover,
        coverImageAuthor: post.coverImageAuthor ?? '',
        coverImageSourceUrl: post.coverImageSourceUrl ?? '',
        writerId: post.writerId ?? '',
        categoryIds: await loadCategoryIds(db, postId),
      }

  const translations: EditorPost['translations'] = {}
  for (const row of rows) {
    const text = row.draft ?? row
    const published = row.status === 'published'
    translations[row.locale] = {
      locale: row.locale,
      number: row.number,
      status: row.status,
      publishedAt: row.publishedAt?.toISOString() ?? null,
      scheduledFor: row.scheduledFor,
      previewToken: row.previewToken,
      title: text.title,
      publishedTitle: published ? row.title : null,
      summary: text.summary,
      content: text.content,
      hasUnpublishedChanges: published && Boolean(row.draft || post.draft),
      savedAt: [row.draft?.savedAt, post.draft?.savedAt, row.updatedAt.toISOString()]
        .filter((value): value is string => Boolean(value))
        .sort()
        .at(-1)!,
    }
  }
  return { id: post.id, live, fields, translations }
}

/** A new post with one empty language, signed by the writer card of whoever creates it. */
export async function createPost(locale: Locale, userId: string) {
  const db = getDb()
  return db.transaction(async tx => {
    const [writer] = await tx.select({ id: writers.id }).from(writers).where(eq(writers.userId, userId))
    const [post] = await tx
      .insert(posts)
      .values({ writerId: writer?.id ?? null })
      .returning({ id: posts.id })
    await tx
      .insert(postTranslations)
      .values({ postId: post!.id, locale, title: '', summary: '', content: emptyContent })
    return post!.id
  })
}

/** Adds the missing language to a post. False when the post does not exist or already has it. */
export async function createTranslation(postId: string, locale: Locale) {
  const db = getDb()
  const [post] = await db.select({ id: posts.id }).from(posts).where(notDeleted(postId))
  if (!post) {
    return false
  }
  const created = await db
    .insert(postTranslations)
    .values({ postId, locale, title: '', summary: '', content: emptyContent })
    .onConflictDoNothing()
    .returning({ number: postTranslations.number })
  return created.length > 0
}

function fieldsOf({ cover, coverImageAuthor, coverImageSourceUrl, writerId, categoryIds }: PostDraft): PostFields {
  return { cover, coverImageAuthor, coverImageSourceUrl, writerId, categoryIds }
}

async function writePostFields(tx: Tx, postId: string, fields: PostFields) {
  await tx
    .update(posts)
    .set({
      cover: fields.cover,
      coverImageAuthor: fields.coverImageAuthor || null,
      coverImageSourceUrl: fields.coverImageSourceUrl || null,
      writerId: fields.writerId || null,
      draft: null,
    })
    .where(eq(posts.id, postId))
  await tx.delete(postCategories).where(eq(postCategories.postId, postId))
  if (fields.categoryIds.length > 0) {
    await tx
      .insert(postCategories)
      .values(fields.categoryIds.map((categoryId, position) => ({ postId, categoryId, position })))
  }
}

async function isLive(tx: Tx, postId: string) {
  const [row] = await tx
    .select({ one: sql`1` })
    .from(postTranslations)
    .where(and(eq(postTranslations.postId, postId), eq(postTranslations.status, 'published')))
    .limit(1)
  return Boolean(row)
}

/**
 * The editor's save, every few seconds while writing. Nothing it saves reaches the site: a
 * published language keeps its edits in its draft, and while any language is published the shared
 * fields wait in the post's draft. Otherwise there is nothing public to protect, so it writes in
 * place. Returns when it saved and whether this language still differs from what readers see
 * (edits undone by hand leave nothing to publish), or undefined when the post or language does
 * not exist.
 */
export async function savePost(postId: string, locale: Locale, input: PostSaveInput, now = new Date()) {
  const db = getDb()
  return db.transaction(async tx => {
    const [row] = await tx
      .select({ translation: postTranslations, post: posts })
      .from(postTranslations)
      .innerJoin(posts, eq(posts.id, postTranslations.postId))
      .where(and(notDeleted(postId), eq(postTranslations.locale, locale)))
    if (!row) {
      return undefined
    }
    const savedAt = now.toISOString()
    const { title, summary, content, ...fields } = input
    const { translation, post } = row
    const where = and(eq(postTranslations.postId, postId), eq(postTranslations.locale, locale))
    const published = translation.status === 'published'
    let pendingText = false
    let pendingFields = false

    if (published) {
      // Back to what readers see: no pending edits. `updatedAt` is the post's public "modified"
      // date: only publishing changes it.
      const draft = sameText({ title, summary, content }, translation) ? null : { title, summary, content, savedAt }
      pendingText = Boolean(draft)
      await tx.update(postTranslations).set({ draft, updatedAt: translation.updatedAt }).where(where)
    } else {
      await tx.update(postTranslations).set({ title, summary, content, draft: null }).where(where)
    }

    if (await isLive(tx, postId)) {
      pendingFields = !sameFields(fields, publishedFields(post, await loadCategoryIds(tx, postId)))
      await tx
        .update(posts)
        .set({ draft: pendingFields ? { ...fields, savedAt } : null })
        .where(eq(posts.id, postId))
    } else {
      await writePostFields(tx, postId, fields)
    }
    return { savedAt, hasUnpublishedChanges: published && (pendingText || pendingFields) }
  })
}

function publishedFields(post: typeof posts.$inferSelect, categoryIds: string[]): PostFields {
  return {
    cover: post.cover,
    coverImageAuthor: post.coverImageAuthor ?? '',
    coverImageSourceUrl: post.coverImageSourceUrl ?? '',
    writerId: post.writerId ?? '',
    categoryIds,
  }
}

/**
 * JSON with every object's keys in order. Postgres keeps jsonb keys in its own order, not the
 * editor's, so a plain stringify finds a saved post different from the same post being edited.
 */
function canonical(value: unknown): string {
  return JSON.stringify(value, (_key, inner: unknown) =>
    inner && typeof inner === 'object' && !Array.isArray(inner)
      ? Object.fromEntries(Object.entries(inner).sort(([a], [b]) => (a < b ? -1 : 1)))
      : inner,
  )
}

// Compared by meaning: the editor adds block ids and times that do not change what readers see.
const blocksOf = (content: DataProp) => canonical(content.blocks.map(({ type, data }) => ({ type, data })))

function sameText(a: { title: string; summary: string; content: DataProp }, b: typeof a) {
  return a.title === b.title && a.summary === b.summary && blocksOf(a.content) === blocksOf(b.content)
}

function sameFields(a: PostFields, b: PostFields) {
  const normal = ({ cover, coverImageAuthor, coverImageSourceUrl, writerId, categoryIds }: PostFields) =>
    canonical([
      cover && [cover.publicId, cover.width, cover.height, cover.alt ?? '', cover.focus ?? null, cover.fit ?? 'cover'],
      coverImageAuthor,
      coverImageSourceUrl,
      writerId,
      categoryIds,
    ])
  return normal(a) === normal(b)
}

type ActionResult = { ok: true; changedSite: boolean } | { ok: false; status: number; error: string }

const fail = (status: number, error: string): ActionResult => ({ ok: false, status, error })

async function selectForAction(tx: Tx, postId: string, locale: Locale) {
  const [row] = await tx
    .select({ translation: postTranslations, post: posts })
    .from(postTranslations)
    .innerJoin(posts, eq(posts.id, postTranslations.postId))
    .where(and(notDeleted(postId), eq(postTranslations.locale, locale)))
  return row
}

type ActionRow = NonNullable<Awaited<ReturnType<typeof selectForAction>>>

/** Puts a language on the site with its pending edits, and the post's pending shared fields. */
async function publishRow(tx: Tx, { translation, post }: ActionRow, now: Date): Promise<ActionResult> {
  const text = translation.draft ?? translation
  const publishable = publishableSchema.safeParse(text)
  if (!publishable.success) {
    return fail(400, publishable.error.issues[0]!.message)
  }
  await tx
    .update(postTranslations)
    .set({
      title: text.title,
      summary: text.summary,
      content: text.content,
      draft: null,
      status: 'published',
      publishedAt: translation.publishedAt ?? now,
      scheduledFor: null,
      updatedAt: now,
    })
    .where(and(eq(postTranslations.postId, post.id), eq(postTranslations.locale, translation.locale)))
  if (post.draft) {
    await writePostFields(tx, post.id, fieldsOf(post.draft))
  }
  return { ok: true, changedSite: true }
}

/** Publish, unpublish, discard the unpublished edits, or (un)schedule a language. */
export async function applyPostAction(
  postId: string,
  locale: Locale,
  action: { action: 'publish' | 'unpublish' | 'discard' } | { action: 'schedule'; date: string | null },
  now = new Date(),
): Promise<ActionResult> {
  return getDb().transaction(async tx => {
    const row = await selectForAction(tx, postId, locale)
    if (!row) {
      return fail(404, 'La entrada no existe')
    }
    const { translation, post } = row
    const where = and(eq(postTranslations.postId, postId), eq(postTranslations.locale, locale))
    const published = translation.status === 'published'

    switch (action.action) {
      case 'publish':
        return publishRow(tx, row, now)

      case 'unpublish': {
        if (!published) {
          return fail(409, 'Esta versión no está publicada')
        }
        // Off the site, its pending edits become the working copy.
        const text = translation.draft ?? translation
        await tx
          .update(postTranslations)
          .set({ title: text.title, summary: text.summary, content: text.content, draft: null, status: 'draft' })
          .where(where)
        if (post.draft && !(await isLive(tx, postId))) {
          await writePostFields(tx, postId, fieldsOf(post.draft))
        }
        return { ok: true, changedSite: true }
      }

      case 'discard':
        if (!published) {
          return fail(409, 'Esta versión no está publicada: no hay cambios que descartar')
        }
        await tx.update(postTranslations).set({ draft: null, updatedAt: translation.updatedAt }).where(where)
        await tx.update(posts).set({ draft: null }).where(eq(posts.id, postId))
        return { ok: true, changedSite: false }

      case 'schedule':
        if (published) {
          return fail(409, 'Esta versión ya está publicada')
        }
        if (action.date && action.date <= madridDate(now)) {
          return fail(400, 'Elige un día a partir de mañana')
        }
        await tx.update(postTranslations).set({ scheduledFor: action.date }).where(where)
        return { ok: true, changedSite: false }
    }
  })
}

/** Today in Madrid, as `YYYY-MM-DD`: scheduled days are the uncle's days, not UTC's. */
export function madridDate(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid' }).format(now)
}

/**
 * The daily cron: publishes every language scheduled for today or earlier (a missed run catches
 * up the next day). One that cannot be published (no title or summary) stays scheduled.
 */
export async function publishScheduled(now = new Date()) {
  const db = getDb()
  const due = await db
    .select({ postId: postTranslations.postId, locale: postTranslations.locale, number: postTranslations.number })
    .from(postTranslations)
    .innerJoin(posts, eq(posts.id, postTranslations.postId))
    .where(
      and(
        isNull(posts.deletedAt),
        ne(postTranslations.status, 'published'),
        lte(postTranslations.scheduledFor, madridDate(now)),
      ),
    )
  const published: number[] = []
  for (const { postId, locale, number } of due) {
    const result = await db.transaction(async tx => publishRow(tx, (await selectForAction(tx, postId, locale))!, now))
    if (result.ok) {
      published.push(number)
    }
  }
  return published
}

/** Takes the post (both languages) off the site and out of the panel. Returns whether it existed. */
export async function deletePost(postId: string, now = new Date()) {
  const deleted = await getDb()
    .update(posts)
    .set({ deletedAt: now })
    .where(notDeleted(postId))
    .returning({ id: posts.id })
  return deleted.length > 0
}

export interface AdminPostRow {
  id: string
  title: string
  updatedAt: string
  categories: string[]
  translations: {
    locale: Locale
    number: number
    status: Status
    scheduledFor: string | null
    hasUnpublishedChanges: boolean
  }[]
}

export interface PostListFilters {
  query?: string
  locale?: Locale
  status?: 'published' | 'draft' | 'scheduled'
  categoryId?: string
  page?: number
}

/** The posts of the panel's list, most recently edited first, with each language's state. */
export async function listPostsForAdmin({ query, locale, status, categoryId, page = 1 }: PostListFilters) {
  const db = getDb()
  const translationWhere = (...conditions: (ReturnType<typeof eq> | undefined)[]) =>
    exists(
      db
        .select({ one: sql`1` })
        .from(postTranslations)
        .where(and(eq(postTranslations.postId, posts.id), ...conditions)),
    )
  const term = query?.trim()
  const statusCondition = {
    published: eq(postTranslations.status, 'published'),
    draft: and(ne(postTranslations.status, 'published'), isNull(postTranslations.scheduledFor)),
    scheduled: and(ne(postTranslations.status, 'published'), sql`${postTranslations.scheduledFor} is not null`),
  }
  const where = and(
    isNull(posts.deletedAt),
    term
      ? translationWhere(
          or(
            sql`unaccent(${postTranslations.title}) ilike unaccent(${`%${term.replace(/[\\%_]/g, char => `\\${char}`)}%`})`,
            eq(postTranslations.number, Number(term) || -1),
          ),
        )
      : undefined,
    locale ? translationWhere(eq(postTranslations.locale, locale)) : undefined,
    status ? translationWhere(statusCondition[status]) : undefined,
    categoryId
      ? exists(
          db
            .select({ one: sql`1` })
            .from(postCategories)
            .where(and(eq(postCategories.postId, posts.id), eq(postCategories.categoryId, categoryId))),
        )
      : undefined,
  )
  const lastEdit = sql<Date>`(select max(${postTranslations.updatedAt}) from ${postTranslations} where ${postTranslations.postId} = ${posts.id})`

  const [{ total }] = (await db.select({ total: count() }).from(posts).where(where)) as [{ total: number }]
  const found = await db
    .select({ id: posts.id, draft: posts.draft, lastEdit })
    .from(posts)
    .where(where)
    .orderBy(desc(lastEdit), desc(posts.createdAt))
    .limit(postListPageSize)
    .offset((Math.max(page, 1) - 1) * postListPageSize)
  if (found.length === 0) {
    return { posts: [] as AdminPostRow[], total }
  }

  const ids = found.map(post => post.id)
  const translations = await db
    .select()
    .from(postTranslations)
    .where(inArray(postTranslations.postId, ids))
    .orderBy(asc(postTranslations.locale))
  const categoryNames = await db
    .select({ postId: postCategories.postId, name: categoryTranslations.name })
    .from(postCategories)
    .innerJoin(categories, eq(categories.id, postCategories.categoryId))
    .innerJoin(
      categoryTranslations,
      and(eq(categoryTranslations.categoryId, categories.id), eq(categoryTranslations.locale, 'es')),
    )
    .where(inArray(postCategories.postId, ids))
    .orderBy(asc(postCategories.position))

  const rows = found.map(post => {
    const own = translations.filter(translation => translation.postId === post.id)
    const titled = own.map(translation => (translation.draft ?? translation).title).find(Boolean)
    return {
      id: post.id,
      title: titled ?? '',
      updatedAt: new Date(post.lastEdit).toISOString(),
      categories: categoryNames.filter(link => link.postId === post.id).map(link => link.name),
      translations: own.map(translation => ({
        locale: translation.locale,
        number: translation.number,
        status: translation.status,
        scheduledFor: translation.scheduledFor,
        hasUnpublishedChanges: translation.status === 'published' && Boolean(translation.draft || post.draft),
      })),
    }
  })
  return { posts: rows, total }
}

/** Options for the editor's author and category pickers. */
export async function listEditorOptions() {
  const db = getDb()
  const [writerOptions, categoryOptions] = await Promise.all([
    db.select({ id: writers.id, name: writers.name }).from(writers).orderBy(asc(writers.name)),
    db
      .select({ id: categories.id, name: categoryTranslations.name })
      .from(categories)
      .innerJoin(
        categoryTranslations,
        and(eq(categoryTranslations.categoryId, categories.id), eq(categoryTranslations.locale, 'es')),
      )
      .orderBy(asc(categoryTranslations.name)),
  ])
  return { writers: writerOptions, categories: categoryOptions }
}
