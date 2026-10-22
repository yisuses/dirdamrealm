/* eslint-disable @typescript-eslint/naming-convention -- Strapi rows keep their column names */
import type { DataProp } from 'editorjs-blocks-react-renderer'
import { randomUUID } from 'node:crypto'

import type { StoredImage } from '../../src/db/schema'

/**
 * Pure mapping from Strapi 5's tables to the new schema (docs/strapi-to-vercel-migration.md §8).
 * No IO here: `run.ts` reads the rows, calls `buildMigration` and writes the result.
 */

type Locale = 'es' | 'en'

export interface StrapiAdminUser {
  id: number
  firstname: string | null
  lastname: string | null
  email: string
  password: string
  is_active: boolean
  blocked: boolean | null
}

export interface StrapiWriter {
  id: number
  document_id: string
  name: string
  twitter: string | null
  personal_url: string | null
}

export interface StrapiCategory {
  id: number
  document_id: string
  code: string
  name: string
  description: string | null
  main: boolean | null
  translations: Partial<Record<Locale, string>> | null
  created_at: Date
  updated_at: Date
}

export interface StrapiPost {
  id: number
  document_id: string
  locale: string
  title: string
  summary: string
  content: string | null
  img_url: string | null
  cover_image_author: string | null
  cover_image_source_url: string | null
  published_at: Date | null
  created_at: Date
  updated_at: Date
}

export interface StrapiFile {
  id: number
  width: number | null
  height: number | null
  alternative_text: string | null
  caption: string | null
  provider_metadata: { public_id?: string } | null
}

export interface StrapiComment {
  id: number
  author: string
  text: string
  created_at: Date
}

export interface StrapiAbout {
  display: boolean | null
  name: string | null
  email: string | null
  description: string | null
  twitter: string | null
  twitter_url: string | null
  facebook: string | null
  facebook_url: string | null
  instagram: string | null
  instagram_url: string | null
  linkedin: string | null
  linkedin_url: string | null
}

export interface StrapiData {
  adminUsers: StrapiAdminUser[]
  writers: StrapiWriter[]
  categories: StrapiCategory[]
  posts: StrapiPost[]
  files: StrapiFile[]
  comments: StrapiComment[]
  about: StrapiAbout | null
  /** `posts_writer_lnk` */
  postWriters: { post_id: number; writer_id: number }[]
  /** `posts_categories_lnk` */
  postCategories: { post_id: number; category_id: number }[]
  /** `files_related_mph` rows for `api::post.post` / `coverImage` */
  postCovers: { related_id: number; file_id: number }[]
  /** `comments_post_lnk` */
  commentPosts: { comment_id: number; post_id: number }[]
}

type EditorContent = DataProp

export interface MigrationReport {
  counts: Record<string, number>
  blockTypes: Record<string, number>
  droppedBlocks: Record<string, number>
  orphanComments: number[]
  postsWithoutWriter: number[]
  unparseableContent: number[]
  coversWithoutPublicId: number[]
  writersSkipped: string[]
}

export function newReport(): MigrationReport {
  return {
    counts: {},
    blockTypes: {},
    droppedBlocks: {},
    orphanComments: [],
    postsWithoutWriter: [],
    unparseableContent: [],
    coversWithoutPublicId: [],
    writersSkipped: [],
  }
}

const LOCALES: Locale[] = ['es', 'en']

// Blocks the new editor offers and the site renders (Content.tsx and the renderer's defaults).
const RENDERABLE_BLOCKS = new Set([
  'paragraph',
  'header',
  'list',
  'quote',
  'image',
  'LinkTool',
  'delimiter',
  'embed',
  'table',
  'code',
])

function increment(record: Record<string, number>, key: string) {
  record[key] = (record[key] ?? 0) + 1
}

/**
 * Parses Strapi's stringified EditorJS content and keeps only the blocks the site can render.
 * Strapi's `mediaLib` blocks are empty placeholders (`{ name: 'mediaLibraryStrapi' }`) left by
 * opening the media picker without choosing anything, so dropping them loses nothing.
 */
export function transformContent(raw: string | null, report: MigrationReport): EditorContent | null {
  // Abandoned drafts can have no content at all; keep them as empty documents, not lost posts.
  if (!raw?.trim()) {
    return { time: 0, version: '', blocks: [] }
  }
  let parsed: Partial<EditorContent> | null
  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }
  if (!parsed || !Array.isArray(parsed.blocks)) {
    return null
  }

  const blocks = parsed.blocks.filter(block => {
    increment(report.blockTypes, block.type)
    if (RENDERABLE_BLOCKS.has(block.type)) {
      return true
    }
    increment(report.droppedBlocks, block.type)
    return false
  })

  return { time: parsed.time ?? 0, version: parsed.version ?? '', blocks }
}

export function toStoredImage(file: StrapiFile): StoredImage | null {
  const publicId = file.provider_metadata?.public_id
  if (!publicId || !file.width || !file.height) {
    return null
  }
  return {
    publicId,
    width: file.width,
    height: file.height,
    ...(file.alternative_text ? { alt: file.alternative_text } : {}),
    ...(file.caption ? { caption: file.caption } : {}),
  }
}

function normalise(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
    .toLowerCase()
}

export function buildMigration(source: StrapiData, uuid: () => string = randomUUID) {
  const report = newReport()

  // Users: Strapi admins. Their bcrypt hashes are copied as-is, so passwords keep working.
  const users = source.adminUsers.map(admin => ({
    id: uuid(),
    email: admin.email.toLowerCase(),
    name: [admin.firstname, admin.lastname].filter(Boolean).join(' '),
    passwordHash: admin.password,
    active: admin.is_active && !admin.blocked,
  }))
  const userIdByName = new Map(users.map(user => [normalise(user.name), user.id]))

  // Writers: only the ones that sign posts, linked to the admin with the same name.
  const writerRowsWithPosts = new Set(source.postWriters.map(link => link.writer_id))
  const writerIdByDocument = new Map<string, string>()
  const writers = source.writers.flatMap(writer => {
    if (writerIdByDocument.has(writer.document_id)) {
      return []
    }
    const signs = source.writers.some(w => w.document_id === writer.document_id && writerRowsWithPosts.has(w.id))
    if (!signs) {
      report.writersSkipped.push(writer.name)
      return []
    }
    const id = uuid()
    writerIdByDocument.set(writer.document_id, id)
    return [
      {
        id,
        userId: userIdByName.get(normalise(writer.name)) ?? null,
        name: writer.name,
        twitter: writer.twitter,
        personalUrl: writer.personal_url,
      },
    ]
  })
  const writerDocumentByRow = new Map(source.writers.map(writer => [writer.id, writer.document_id]))

  // Categories: one per document; the `translations` JSON becomes a row per locale.
  const categoryIdByDocument = new Map<string, string>()
  const categories: { id: string; code: string; main: boolean; createdAt: Date; updatedAt: Date }[] = []
  const categoryTranslations: { categoryId: string; locale: Locale; name: string; description: string }[] = []
  for (const category of source.categories) {
    if (categoryIdByDocument.has(category.document_id)) {
      continue
    }
    const id = uuid()
    categoryIdByDocument.set(category.document_id, id)
    categories.push({
      id,
      code: category.code,
      main: Boolean(category.main),
      createdAt: category.created_at,
      updatedAt: category.updated_at,
    })
    for (const locale of LOCALES) {
      categoryTranslations.push({
        categoryId: id,
        locale,
        name: category.translations?.[locale] || category.name,
        description: category.description ?? '',
      })
    }
  }
  const categoryDocumentByRow = new Map(source.categories.map(category => [category.id, category.document_id]))

  // Posts: a Strapi document becomes a post; each locale becomes a translation. The published
  // row's id is the number in every public url, so it becomes the translation's `number`.
  const rowsByDocument = new Map<string, StrapiPost[]>()
  for (const row of source.posts) {
    rowsByDocument.set(row.document_id, [...(rowsByDocument.get(row.document_id) ?? []), row])
  }
  const filesById = new Map(source.files.map(file => [file.id, file]))
  const coverFileByRow = new Map(source.postCovers.map(link => [link.related_id, link.file_id]))
  const writerRowByPostRow = new Map(source.postWriters.map(link => [link.post_id, link.writer_id]))

  let nextNumber = Math.max(0, ...source.posts.map(row => row.id)) + 1
  const translationNumberByRow = new Map<number, number>()
  const posts: {
    id: string
    writerId: string | null
    cover: StoredImage | null
    coverImageAuthor: string | null
    coverImageSourceUrl: string | null
    imgUrl: string | null
    createdAt: Date
    updatedAt: Date
  }[] = []
  const postTranslations: {
    postId: string
    locale: Locale
    number: number
    title: string
    summary: string
    content: EditorContent
    status: 'draft' | 'published'
    publishedAt: Date | null
    createdAt: Date
    updatedAt: Date
  }[] = []
  const postCategories: { postId: string; categoryId: string }[] = []

  for (const rows of rowsByDocument.values()) {
    const translationRows = LOCALES.flatMap(locale => {
      const localeRows = rows.filter(row => row.locale === locale)
      // Strapi keeps a draft row next to every published one; nothing has unpublished edits,
      // so the published row is the content, and a draft row alone is an unpublished post.
      const row = localeRows.find(r => r.published_at) ?? localeRows[0]
      return row ? [{ locale, row, siblings: localeRows }] : []
    })
    if (translationRows.length === 0) {
      continue
    }

    const shared = (translationRows.find(t => t.locale === 'es') ?? translationRows[0]).row
    const postId = uuid()
    const writerRow = writerRowByPostRow.get(shared.id)
    const writerDocument = writerRow === undefined ? undefined : writerDocumentByRow.get(writerRow)
    const writerId = writerDocument ? (writerIdByDocument.get(writerDocument) ?? null) : null
    if (!writerId && shared.published_at) {
      report.postsWithoutWriter.push(shared.id)
    }

    const coverFile = coverFileByRow.get(shared.id)
    const file = coverFile === undefined ? undefined : filesById.get(coverFile)
    const cover = file ? toStoredImage(file) : null
    if (file && !cover) {
      report.coversWithoutPublicId.push(file.id)
    }

    posts.push({
      id: postId,
      writerId,
      cover,
      coverImageAuthor: shared.cover_image_author,
      coverImageSourceUrl: shared.cover_image_source_url,
      imgUrl: shared.img_url || null,
      createdAt: shared.created_at,
      updatedAt: shared.updated_at,
    })

    for (const { locale, row, siblings } of translationRows) {
      const content = transformContent(row.content, report)
      if (!content) {
        report.unparseableContent.push(row.id)
        continue
      }
      const number = row.published_at ? row.id : nextNumber++
      siblings.forEach(sibling => translationNumberByRow.set(sibling.id, number))
      postTranslations.push({
        postId,
        locale,
        number,
        title: row.title,
        summary: row.summary,
        content,
        status: row.published_at ? 'published' : 'draft',
        publishedAt: row.published_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })
    }

    const categoryDocuments = new Set(
      rows.flatMap(row =>
        source.postCategories
          .filter(link => link.post_id === row.id)
          .map(link => categoryDocumentByRow.get(link.category_id))
          .filter((document): document is string => Boolean(document)),
      ),
    )
    for (const document of categoryDocuments) {
      const categoryId = categoryIdByDocument.get(document)
      if (categoryId) {
        postCategories.push({ postId, categoryId })
      }
    }
  }

  // Comments: Strapi links each one to both the draft and the published row of its post; both
  // map to the same translation number. Comments linked to no post are reported and skipped.
  const commentNumbers = new Map<number, number>()
  for (const link of source.commentPosts) {
    const number = translationNumberByRow.get(link.post_id)
    if (number !== undefined && !commentNumbers.has(link.comment_id)) {
      commentNumbers.set(link.comment_id, number)
    }
  }
  const comments = source.comments.flatMap(comment => {
    const postNumber = commentNumbers.get(comment.id)
    if (postNumber === undefined) {
      report.orphanComments.push(comment.id)
      return []
    }
    return [{ id: comment.id, postNumber, author: comment.author, text: comment.text, createdAt: comment.created_at }]
  })

  // Contact and social links, from Strapi's `about` single type. Order matches the footer.
  const about = source.about
  const siteContact = about ? { id: 1, display: about.display ?? true, name: about.name, email: about.email } : null
  const siteContactTranslations = LOCALES.map(locale => ({ locale, description: about?.description ?? '' }))
  const socialLinks = about
    ? (
        [
          ['twitter', about.twitter, about.twitter_url],
          ['facebook', about.facebook, about.facebook_url],
          ['instagram', about.instagram, about.instagram_url],
          ['linkedin', about.linkedin, about.linkedin_url],
        ] as const
      )
        .filter(([, , url]) => Boolean(url))
        .map(([network, handle, url], position) => ({ network, handle, url: url as string, position }))
    : []

  report.counts = {
    users: users.length,
    writers: writers.length,
    categories: categories.length,
    posts: posts.length,
    postTranslations: postTranslations.length,
    publishedTranslations: postTranslations.filter(t => t.status === 'published').length,
    postCategories: postCategories.length,
    comments: comments.length,
    socialLinks: socialLinks.length,
  }

  return {
    rows: {
      users,
      writers,
      categories,
      categoryTranslations,
      posts,
      postTranslations,
      postCategories,
      comments,
      siteContact,
      siteContactTranslations,
      socialLinks,
    },
    report,
  }
}

export type Migration = ReturnType<typeof buildMigration>
