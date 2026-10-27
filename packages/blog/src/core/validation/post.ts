import { z } from 'zod'

/** The blocks the editor offers: exactly the ones the site knows how to show. */
export const editorBlockTypes = [
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
] as const

// Generous for text, but it keeps a runaway paste from filling the database.
const maxContentBytes = 1024 * 1024

export const editorContentSchema = z
  .object({
    time: z.number().default(0),
    version: z.string().max(20).default(''),
    blocks: z
      .array(
        z.object({
          id: z.string().max(50).optional(),
          type: z.enum(editorBlockTypes),
          data: z.record(z.string(), z.unknown()),
        }),
      )
      .max(3000),
  })
  .refine(content => JSON.stringify(content).length <= maxContentBytes, 'El texto es demasiado largo')

const storedImageSchema = z.object({
  publicId: z.string().regex(/^[\w-]{1,200}$/),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  alt: z.string().max(300).optional(),
  focus: z.object({ x: z.number().min(0).max(100), y: z.number().min(0).max(100) }).optional(),
  fit: z.enum(['cover', 'contain']).optional(),
})

/** What both languages of a post share. */
export const postFieldsSchema = z.object({
  cover: storedImageSchema.nullable(),
  coverImageAuthor: z.string().trim().max(120, 'Máximo 120 caracteres'),
  coverImageSourceUrl: z.union([
    z.literal(''),
    z.url({ protocol: /^https?$/, error: 'Escribe la dirección completa, empezando por https://' }),
  ]),
  writerId: z.union([z.literal(''), z.uuid()]),
  // In order: the first is the main one, used for the "more like this" list.
  categoryIds: z.array(z.uuid()).max(10, 'Como mucho 10 categorías'),
})

/**
 * Everything the editor saves, every few seconds while typing. Titles may be empty while
 * drafting; publishing is what requires them (see `publishableSchema`).
 */
export const postSaveSchema = postFieldsSchema.extend({
  title: z.string().trim().max(200, 'Máximo 200 caracteres'),
  summary: z.string().trim().max(500, 'Máximo 500 caracteres'),
  content: editorContentSchema,
})

export const publishableSchema = z.object({
  title: z.string().trim().min(1, 'Ponle un título antes de publicar'),
  summary: z.string().trim().min(1, 'Escribe un resumen antes de publicar: es lo que se ve en las portadas'),
})

export const localeSchema = z.enum(['es', 'en'])

/** Posts per page in the panel's list. */
export const postListPageSize = 25

/** A day in the future, as the date input gives it. */
export const scheduleSchema = z.object({
  date: z.iso.date('Elige un día').nullable(),
})

export const postActionSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('publish') }),
  z.object({ action: z.literal('unpublish') }),
  z.object({ action: z.literal('discard') }),
  z.object({ action: z.literal('schedule'), date: scheduleSchema.shape.date }),
])

export type PostFields = z.infer<typeof postFieldsSchema>
export type PostSaveInput = z.infer<typeof postSaveSchema>
export type PostAction = z.infer<typeof postActionSchema>
