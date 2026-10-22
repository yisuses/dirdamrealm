import type { InfiniteData, QueryClient } from '@tanstack/react-query'
import axios from 'axios'

import { type LibraryImage, toLibraryImage } from '@blog/core/cloudinary/libraryImage'
import type { ImageMetaInput } from '@blog/core/validation/image'
import { cloudinaryUrl } from '@blog/db/queries/media'

export interface LibraryPage {
  images: LibraryImage[]
  total: number
  nextCursor: string | null
}

/** Cached for a minute: Cloudinary allows 500 searches an hour, and its index lags a few seconds. */
export const libraryStaleTime = 60_000

export function libraryQueryKey(query: string) {
  return ['images', query] as const
}

export async function fetchLibraryPage(query: string, cursor: string | null): Promise<LibraryPage> {
  const { data } = await axios.get<LibraryPage>('/api/admin/images/', {
    params: { q: query || undefined, cursor: cursor ?? undefined },
  })
  return data
}

export const thumbnailUrl = (publicId: string) => cloudinaryUrl(publicId, 'c_limit,w_400,h_300,f_auto,q_auto')
export const previewUrl = (publicId: string) => cloudinaryUrl(publicId, 'c_limit,w_900,h_900,f_auto,q_auto')
export const originalUrl = (publicId: string) => cloudinaryUrl(publicId, 'f_auto,q_auto')

export function formatBytes(bytes: number) {
  const format = (value: number) => value.toLocaleString('es-ES', { maximumFractionDigits: 1 })
  return bytes >= 1024 * 1024 ? `${format(bytes / 1024 / 1024)} MB` : `${format(bytes / 1024)} KB`
}

/** The suggested name for a file: its name without the extension, with spaces instead of `_` and `-`. */
export function nameFromFile(file: File) {
  return file.name
    .replace(/\.[^.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .trim()
}

/** Asks the server for a signature, then sends the file straight from the browser to Cloudinary. */
export async function uploadImage(file: File, meta: ImageMetaInput, onProgress: (percent: number) => void) {
  const { data: signed } = await axios.post<{ url: string; fields: Record<string, string | number> }>(
    '/api/admin/images/signature/',
    meta,
  )
  const form = new FormData()
  Object.entries(signed.fields).forEach(([key, value]) => form.append(key, String(value)))
  form.append('file', file)
  const { data } = await axios.post(signed.url, form, {
    onUploadProgress: ({ loaded, total }) => onProgress(total ? Math.round((loaded / total) * 100) : 0),
  })
  return toLibraryImage(data)
}

// The library's cached pages are updated by hand after each change, because Cloudinary's search
// takes a few seconds to see new, edited or deleted images.
type Pages = InfiniteData<LibraryPage>

/** A new image goes first in the unfiltered library; searches pick it up once Cloudinary indexes it. */
export function addToLibrary(queryClient: QueryClient, image: LibraryImage) {
  queryClient.setQueryData<Pages>(libraryQueryKey(''), data => {
    if (!data) {
      return data
    }
    const [first, ...rest] = data.pages
    return { ...data, pages: [{ ...first!, total: first!.total + 1, images: [image, ...first!.images] }, ...rest] }
  })
}

export function replaceInLibrary(queryClient: QueryClient, image: LibraryImage) {
  queryClient.setQueriesData<Pages>({ queryKey: ['images'] }, data => {
    if (!data) {
      return data
    }
    const pages = data.pages.map(page => ({
      ...page,
      images: page.images.map(other => (other.publicId === image.publicId ? image : other)),
    }))
    return { ...data, pages }
  })
}

export function removeFromLibrary(queryClient: QueryClient, publicId: string) {
  queryClient.setQueriesData<Pages>({ queryKey: ['images'] }, data => {
    if (!data?.pages.some(page => page.images.some(image => image.publicId === publicId))) {
      return data
    }
    const pages = data.pages.map(page => ({
      ...page,
      total: page.total - 1,
      images: page.images.filter(image => image.publicId !== publicId),
    }))
    return { ...data, pages }
  })
}
