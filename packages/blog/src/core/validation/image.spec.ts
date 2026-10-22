import { describe, expect, it } from 'vitest'

import { imageMetaSchema, isPublicId } from './image'

describe('image validation', () => {
  it('should require a name and trim both fields', () => {
    expect(imageMetaSchema.parse({ name: ' Sol ', alt: ' Un sol ' })).toEqual({ name: 'Sol', alt: 'Un sol' })
    expect(imageMetaSchema.safeParse({ name: ' ', alt: '' }).success).toBe(false)
    expect(imageMetaSchema.safeParse({ name: 'x'.repeat(101), alt: '' }).success).toBe(false)
    expect(imageMetaSchema.safeParse({ name: 'x', alt: 'x'.repeat(301) }).success).toBe(false)
  })

  it('should only accept flat Cloudinary ids', () => {
    expect(isPublicId('portada_4_54086b681c')).toBe(true)
    expect(isPublicId('mi-foto')).toBe(true)
    expect(isPublicId('carpeta/foto')).toBe(false)
    expect(isPublicId('')).toBe(false)
    expect(isPublicId('../x')).toBe(false)
  })
})
