import type { StoredImage } from '../schema'

// Strapi's default breakpoints, which the site's image helpers choose between. Each variant
// fits inside its box and, as in Strapi, exists only when the original is larger.
const FORMATS: Record<FormatType, { width: number; height: number }> = {
  thumbnail: { width: 245, height: 156 },
  small: { width: 500, height: 500 },
  medium: { width: 750, height: 750 },
  large: { width: 1000, height: 1000 },
}

export function cloudinaryUrl(publicId: string, transformation: string) {
  return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${transformation}/${publicId}`
}

function toFormat(image: StoredImage, box: { width: number; height: number }): MediaFormat {
  const scale = Math.min(box.width / image.width, box.height / image.height)
  return {
    url: cloudinaryUrl(image.publicId, `c_limit,w_${box.width},h_${box.height},f_auto,q_auto`),
    width: Math.round(image.width * scale),
    height: Math.round(image.height * scale),
    ext: '',
    hash: '',
    mime: '',
    name: image.publicId,
    path: null,
    size: 0,
  }
}

/** A stored Cloudinary image in the `Media` shape the site has always received from Strapi. */
export function toMedia(image: StoredImage): Media {
  const formats = Object.fromEntries(
    (Object.entries(FORMATS) as [FormatType, { width: number; height: number }][])
      .filter(([, box]) => image.width > box.width || image.height > box.height)
      .map(([type, box]) => [type, toFormat(image, box)]),
  ) as Record<FormatType, MediaFormat | undefined>

  return {
    id: 0,
    name: image.publicId,
    alternativeText: image.alt ?? '',
    caption: image.caption ?? '',
    width: image.width,
    height: image.height,
    formats,
    hash: '',
    ext: '',
    mime: '',
    size: 0,
    url: cloudinaryUrl(image.publicId, 'f_auto,q_auto'),
    previewUrl: null,
    provider: 'cloudinary',
    createdAt: '',
    updatedAt: '',
    ...(image.focus && { focus: image.focus }),
    ...(image.fit && { fit: image.fit }),
  }
}
