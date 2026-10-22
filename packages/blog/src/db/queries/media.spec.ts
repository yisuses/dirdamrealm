import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { cloudinaryUrl, toMedia } from './media'

describe('media', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME', 'demo')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('should build delivery urls with the given transformation', () => {
    expect(cloudinaryUrl('folder/photo', 'f_auto,q_auto')).toBe(
      'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto/folder/photo',
    )
  })

  it('should expose every breakpoint the original is larger than, fitted inside its box', () => {
    const media = toMedia({ publicId: 'photo', width: 2000, height: 1000, alt: 'Alt', caption: 'Pie' })

    expect(media).toMatchObject({
      name: 'photo',
      alternativeText: 'Alt',
      caption: 'Pie',
      width: 2000,
      height: 1000,
      url: 'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto/photo',
      provider: 'cloudinary',
    })
    expect(media.formats.thumbnail).toMatchObject({
      url: 'https://res.cloudinary.com/demo/image/upload/c_limit,w_245,h_156,f_auto,q_auto/photo',
      width: 245,
      height: 123,
    })
    expect(media.formats.small).toMatchObject({ width: 500, height: 250 })
    expect(media.formats.medium).toMatchObject({ width: 750, height: 375 })
    expect(media.formats.large).toMatchObject({ width: 1000, height: 500 })
  })

  it('should leave out breakpoints the original fits in, and missing texts empty', () => {
    const media = toMedia({ publicId: 'small', width: 600, height: 120 })

    expect(Object.keys(media.formats)).toEqual(['thumbnail', 'small'])
    expect(media.alternativeText).toBe('')
    expect(media.caption).toBe('')
  })
})
