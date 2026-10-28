import { v2 as cloudinary } from 'cloudinary'
import { randomBytes } from 'node:crypto'
import 'server-only'
import slugify from 'slugify'

import type { ImageMetaInput } from '@blog/core/validation/image'

import { type CloudinaryResource, type LibraryImage, toLibraryImage } from './libraryImage'

// Strapi stored a resized copy of every upload as its own image, named after the original.
const strapiCopies = ['thumbnail', 'small', 'medium', 'large']
const withoutStrapiCopies = `NOT (${strapiCopies.map(prefix => `public_id:${prefix}_*`).join(' OR ')})`
const pageSize = 30

/** The one place that holds Cloudinary's credentials; they never leave the server. */
function api() {
  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  })
  return cloudinary
}

const withoutAccents = (value: string) => value.normalize('NFD').replace(/\p{Diacritic}/gu, '')

function isStrapiCopy(publicId: string) {
  return strapiCopies.some(prefix => publicId.startsWith(`${prefix}_`))
}

/** Words to search for, without accents and without anything the search syntax would read as an operator. */
function searchTerms(query: string) {
  return (
    withoutAccents(query)
      .toLowerCase()
      .match(/[a-z\d]+/g)
      ?.slice(0, 5) ?? []
  ).map(word => `${word}*`)
}

/** Newest first, a page at a time; every word of `query` must start a word of the name or id. */
export async function listImages({ cursor, query = '' }: { cursor?: string; query?: string }) {
  const expression = ['resource_type:image', ...searchTerms(query), withoutStrapiCopies]
  let search = api()
    .search.expression(expression.join(' AND '))
    .with_field('context')
    .sort_by('created_at', 'desc')
    .max_results(pageSize)
  if (cursor) {
    search = search.next_cursor(cursor)
  }
  const result = await search.execute()
  return {
    images: (result.resources as CloudinaryResource[]).map(toLibraryImage),
    total: result.total_count as number,
    nextCursor: (result.next_cursor as string | undefined) ?? null,
  }
}

export async function getImage(publicId: string): Promise<LibraryImage | undefined> {
  if (isStrapiCopy(publicId)) {
    return undefined
  }
  try {
    return toLibraryImage(await api().api.resource(publicId, { context: true }))
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/naming-convention -- Cloudinary's error shape
    if ((error as { error?: { http_code?: number } }).error?.http_code === 404) {
      return undefined
    }
    throw error
  }
}

// `=` and `|` separate the fields of Cloudinary's context string. Its search does not ignore
// accents, so the name is also stored without them: "pruebalo" then finds "Pruébalo".
function encodeContext({ name, alt }: ImageMetaInput) {
  const escape = (value: string) => value.replace(/([=|])/g, '\\$1')
  return `name=${escape(name)}|alt=${escape(alt)}|search=${escape(withoutAccents(name))}`
}

export async function updateImage(publicId: string, meta: ImageMetaInput) {
  return toLibraryImage(await api().api.update(publicId, { context: encodeContext(meta) }))
}

/** Deletes the image and the copies Strapi made of it, and clears them from Cloudinary's CDN. */
export async function deleteImage(publicId: string) {
  await api().api.delete_resources([publicId, ...strapiCopies.map(prefix => `${prefix}_${publicId}`)], {
    invalidate: true,
  })
}

/**
 * Everything the browser needs to upload one image straight to Cloudinary, signed here so the
 * secret stays on the server and the file does not pass through (or count against) our functions.
 * The id is readable, from the name, with a random suffix so names can repeat.
 */
export function signUpload(meta: ImageMetaInput) {
  const slug = slugify(meta.name, { lower: true, strict: true, replacement: '_' }).slice(0, 60) || 'imagen'
  const params = {
    public_id: `${slug}_${randomBytes(5).toString('hex')}`,
    context: encodeContext(meta),
    allowed_formats: 'jpg,jpeg,png,webp,gif,avif,heic',
    timestamp: Math.round(Date.now() / 1000),
  }
  const signature = api().utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET!)
  return {
    url: `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
    fields: { ...params, api_key: process.env.CLOUDINARY_API_KEY!, signature },
  }
}
