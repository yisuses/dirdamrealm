import { z } from 'zod'

/** Cloudinary limits images to 10 MB on the free plan. */
export const maxImageBytes = 10 * 1024 * 1024

/** What the panel edits about an image. Both live in the image's own metadata in Cloudinary. */
export const imageMetaSchema = z.object({
  name: z.string().trim().min(1, 'Escribe un nombre').max(100, 'Máximo 100 caracteres'),
  alt: z.string().trim().max(300, 'Máximo 300 caracteres'),
})

export type ImageMetaInput = z.infer<typeof imageMetaSchema>

// Ids in this library are flat (no folders): letters, digits, `_` and `-`.
const publicIdPattern = /^[\w-]{1,200}$/

export function isPublicId(value: string) {
  return publicIdPattern.test(value)
}
