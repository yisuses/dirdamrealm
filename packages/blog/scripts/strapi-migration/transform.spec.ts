import { describe, expect, it } from 'vitest'

import {
  type StrapiData,
  buildMigration,
  newReport,
  parseStrapiTimestamp,
  toStoredImage,
  transformContent,
} from './transform'

const date = new Date('2026-01-01T00:00:00.000Z')
const content = (blocks: { type: string; data?: object }[]) =>
  JSON.stringify({ time: 1, version: '2.28.2', blocks: blocks.map(b => ({ data: {}, ...b })) })

const post = (overrides: Partial<StrapiData['posts'][number]>) => ({
  id: 1,
  document_id: 'doc-1',
  locale: 'es',
  title: 'Hola',
  summary: 'Resumen',
  content: content([{ type: 'paragraph', data: { text: 'Texto' } }]),
  img_url: '',
  cover_image_author: 'Autora',
  cover_image_source_url: 'https://unsplash.com/x',
  published_at: date,
  created_at: date,
  updated_at: date,
  ...overrides,
})

const source = (overrides: Partial<StrapiData> = {}): StrapiData => ({
  adminUsers: [
    {
      id: 3,
      firstname: 'José',
      lastname: 'Madrid',
      email: 'Jose@Example.com',
      password: '$2a$10$hash',
      is_active: true,
      blocked: false,
    },
    {
      id: 1,
      firstname: 'Saúl',
      lastname: null,
      email: 'saul@example.com',
      password: '$2a$10$other',
      is_active: true,
      blocked: true,
    },
  ],
  writers: [
    { id: 2, document_id: 'w-jose', name: 'Jose Madrid', twitter: '@jose', personal_url: null },
    { id: 1, document_id: 'w-saul', name: 'Saúl de León', twitter: null, personal_url: null },
  ],
  categories: [
    {
      id: 6,
      document_id: 'c-tra',
      code: 'TRA',
      name: 'Travel',
      description: 'Viajes',
      main: true,
      translations: { es: 'Viajes' },
      created_at: date,
      updated_at: date,
    },
    {
      id: 7,
      document_id: 'c-tra',
      code: 'TRA',
      name: 'Travel',
      description: null,
      main: null,
      translations: null,
      created_at: date,
      updated_at: date,
    },
  ],
  posts: [
    post({ id: 10, published_at: null }),
    post({ id: 11 }),
    post({ id: 12, locale: 'en', title: 'Hello', published_at: null }),
    post({ id: 13, locale: 'en', title: 'Hello' }),
    post({ id: 20, document_id: 'doc-draft', title: 'Borrador', published_at: null }),
  ],
  files: [
    {
      id: 5,
      width: 1000,
      height: 600,
      alternative_text: 'Alt',
      caption: null,
      provider_metadata: { public_id: 'cover_abc' },
    },
  ],
  comments: [
    { id: 100, author: 'Ana', text: 'Bien', created_at: date },
    { id: 101, author: 'Luis', text: 'Huérfano', created_at: date },
  ],
  about: {
    display: true,
    name: 'Emoción Blanca',
    email: 'hola@whemotion.com',
    description: null,
    twitter: '@whe',
    twitter_url: 'https://twitter.com/whe',
    facebook: null,
    facebook_url: null,
    instagram: 'whe',
    instagram_url: 'https://instagram.com/whe',
    linkedin: null,
    linkedin_url: null,
  },
  postWriters: [{ post_id: 11, writer_id: 2 }],
  postCategories: [
    { post_id: 10, category_id: 6 },
    { post_id: 11, category_id: 7 },
  ],
  postCovers: [{ related_id: 11, file_id: 5 }],
  commentPosts: [
    { comment_id: 100, post_id: 10 },
    { comment_id: 100, post_id: 11 },
  ],
  ...overrides,
})

let counter = 0
const sequentialUuid = () => `uuid-${++counter}`

describe('transformContent', () => {
  it('should keep renderable blocks and drop the rest, counting both', () => {
    const report = newReport()

    const result = transformContent(
      content([{ type: 'paragraph' }, { type: 'mediaLib', data: { name: 'mediaLibraryStrapi' } }, { type: 'image' }]),
      report,
    )

    expect(result?.blocks.map(b => b.type)).toEqual(['paragraph', 'image'])
    expect(report.blockTypes).toEqual({ paragraph: 1, mediaLib: 1, image: 1 })
    expect(report.droppedBlocks).toEqual({ mediaLib: 1 })
  })

  it('should give the renderer a string version even when Strapi stored none', () => {
    expect(transformContent(JSON.stringify({ blocks: [] }), newReport())?.version).toBe('')
  })

  it('should keep a post without content as an empty document', () => {
    expect(transformContent(null, newReport())).toEqual({ time: 0, version: '', blocks: [] })
    expect(transformContent('  ', newReport())).toEqual({ time: 0, version: '', blocks: [] })
  })

  it('should reject content that is not EditorJS JSON', () => {
    expect(transformContent('not json', newReport())).toBeNull()
    expect(transformContent('{"time":1}', newReport())).toBeNull()
    expect(transformContent('null', newReport())).toBeNull()
  })
})

describe('parseStrapiTimestamp', () => {
  it('should read a timestamp without time zone as UTC, not local time', () => {
    expect(parseStrapiTimestamp('2026-10-20 19:26:47.963').toISOString()).toBe('2026-10-20T19:26:47.963Z')
  })
})

describe('toStoredImage', () => {
  it('should keep the Cloudinary public id, size and only the texts that exist', () => {
    expect(
      toStoredImage({
        id: 1,
        width: 10,
        height: 20,
        alternative_text: null,
        caption: 'Pie',
        provider_metadata: { public_id: 'p' },
      }),
    ).toEqual({ publicId: 'p', width: 10, height: 20, caption: 'Pie' })
  })

  it('should refuse files without a public id or dimensions', () => {
    expect(
      toStoredImage({ id: 1, width: 10, height: 20, alternative_text: null, caption: null, provider_metadata: null }),
    ).toBeNull()
    expect(
      toStoredImage({
        id: 1,
        width: null,
        height: 20,
        alternative_text: null,
        caption: null,
        provider_metadata: { public_id: 'p' },
      }),
    ).toBeNull()
  })
})

describe('buildMigration', () => {
  const { rows, report } = buildMigration(source(), sequentialUuid)

  it('should copy admins with their bcrypt hash, lowercased email and active state', () => {
    expect(rows.users).toEqual([
      {
        id: expect.any(String),
        email: 'jose@example.com',
        name: 'José Madrid',
        passwordHash: '$2a$10$hash',
        active: true,
      },
      { id: expect.any(String), email: 'saul@example.com', name: 'Saúl', passwordHash: '$2a$10$other', active: false },
    ])
  })

  it('should keep only writers who sign posts, linked to the admin with the same name ignoring accents', () => {
    expect(rows.writers).toEqual([
      { id: expect.any(String), userId: rows.users[0]!.id, name: 'Jose Madrid', twitter: '@jose', personalUrl: null },
    ])
    expect(report.writersSkipped).toEqual(['Saúl de León'])
  })

  it('should create one category per document with a translation per locale', () => {
    expect(rows.categories).toEqual([
      { id: expect.any(String), code: 'TRA', main: true, createdAt: date, updatedAt: date },
    ])
    expect(rows.categoryTranslations).toEqual([
      { categoryId: rows.categories[0]!.id, locale: 'es', name: 'Viajes', description: 'Viajes' },
      { categoryId: rows.categories[0]!.id, locale: 'en', name: 'Travel', description: 'Viajes' },
    ])
  })

  it('should turn each document into a post whose translations keep the published row ids as numbers', () => {
    const published = rows.postTranslations.filter(t => t.status === 'published')
    expect(published.map(t => [t.locale, t.number, t.title])).toEqual([
      ['es', 11, 'Hola'],
      ['en', 13, 'Hello'],
    ])
    expect(new Set(published.map(t => t.postId)).size).toBe(1)
  })

  it('should give draft-only posts new numbers past every Strapi id', () => {
    expect(rows.postTranslations.find(t => t.title === 'Borrador')).toMatchObject({ number: 21, status: 'draft' })
  })

  it('should carry the shared fields, writer, cover and categories to the post', () => {
    const [published] = rows.posts
    expect(published).toMatchObject({
      writerId: rows.writers[0]!.id,
      cover: { publicId: 'cover_abc', width: 1000, height: 600, alt: 'Alt' },
      coverImageAuthor: 'Autora',
      imgUrl: null,
    })
    expect(rows.postCategories).toEqual([{ postId: published!.id, categoryId: rows.categories[0]!.id }])
  })

  it('should map comments to the translation number once and skip orphans', () => {
    expect(rows.comments).toEqual([{ id: 100, postNumber: 11, author: 'Ana', text: 'Bien', createdAt: date }])
    expect(report.orphanComments).toEqual([101])
  })

  it('should split about into the contact row and the visible social links in footer order', () => {
    expect(rows.siteContact).toEqual({ id: 1, display: true, name: 'Emoción Blanca', email: 'hola@whemotion.com' })
    expect(rows.siteContactTranslations).toEqual([
      { locale: 'es', description: '' },
      { locale: 'en', description: '' },
    ])
    expect(rows.socialLinks).toEqual([
      { network: 'twitter', handle: '@whe', url: 'https://twitter.com/whe', position: 0 },
      { network: 'instagram', handle: 'whe', url: 'https://instagram.com/whe', position: 1 },
    ])
  })

  it('should count what it produced', () => {
    expect(report.counts).toEqual({
      users: 2,
      writers: 1,
      categories: 1,
      posts: 2,
      postTranslations: 3,
      publishedTranslations: 2,
      postCategories: 1,
      comments: 1,
      socialLinks: 2,
    })
  })

  it('should report what it could not migrate', () => {
    const { rows: edge, report: edgeReport } = buildMigration(
      source({
        posts: [post({ id: 30, content: 'broken' }), post({ id: 31, document_id: 'doc-2', locale: 'fr' })],
        files: [{ id: 5, width: 1, height: 1, alternative_text: null, caption: null, provider_metadata: null }],
        postWriters: [],
        postCovers: [{ related_id: 30, file_id: 5 }],
        about: null,
      }),
      sequentialUuid,
    )

    expect(edgeReport.unparseableContent).toEqual([30])
    expect(edgeReport.postsWithoutWriter).toEqual([30])
    expect(edgeReport.coversWithoutPublicId).toEqual([5])
    expect(edge.posts).toHaveLength(1)
    expect(edge.siteContact).toBeNull()
    expect(edge.socialLinks).toEqual([])
    expect(edge.siteContactTranslations[0]).toEqual({ locale: 'es', description: '' })
  })

  it('should leave the writer empty when a link points at an unknown writer row', () => {
    const { rows: edge } = buildMigration(source({ postWriters: [{ post_id: 11, writer_id: 99 }] }), sequentialUuid)

    expect(edge.posts[0]!.writerId).toBeNull()
    expect(edge.writers).toEqual([])
  })
})
