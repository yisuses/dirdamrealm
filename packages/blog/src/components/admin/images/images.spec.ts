import { QueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { type Mocked, beforeEach, describe, expect, it, vi } from 'vitest'

import type { LibraryImage } from '@blog/core/cloudinary/libraryImage'

import {
  addToLibrary,
  fetchLibraryPage,
  formatBytes,
  libraryQueryKey,
  nameFromFile,
  originalUrl,
  previewUrl,
  removeFromLibrary,
  replaceInLibrary,
  thumbnailUrl,
  uploadImage,
} from './images'

vi.mock('axios', async importOriginal => {
  const actual = await importOriginal<typeof import('axios')>()
  return { ...actual, default: { ...actual.default, get: vi.fn(), post: vi.fn() } }
})
const mockedAxios = axios as Mocked<typeof axios>

const image = (publicId: string, name = publicId): LibraryImage => ({
  publicId,
  name,
  alt: '',
  width: 10,
  height: 10,
  format: 'png',
  bytes: 1,
  createdAt: '2026-10-22T10:00:00Z',
})
const page = (images: LibraryImage[], total: number) => ({ images, total, nextCursor: null })

function clientWith(query: string, pages: ReturnType<typeof page>[]) {
  const queryClient = new QueryClient()
  queryClient.setQueryData(libraryQueryKey(query), { pages, pageParams: pages.map(() => null) })
  return queryClient
}
const imagesOf = (queryClient: QueryClient, query: string) =>
  queryClient
    .getQueryData<{ pages: { images: LibraryImage[]; total: number }[] }>(libraryQueryKey(query))
    ?.pages.map(p => [p.total, p.images.map(i => i.name)])

describe('image library helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME', 'demo')
  })

  it('should build Cloudinary urls for each size', () => {
    expect(thumbnailUrl('a')).toBe('https://res.cloudinary.com/demo/image/upload/c_limit,w_400,h_300,f_auto,q_auto/a')
    expect(previewUrl('a')).toBe('https://res.cloudinary.com/demo/image/upload/c_limit,w_900,h_900,f_auto,q_auto/a')
    expect(originalUrl('a')).toBe('https://res.cloudinary.com/demo/image/upload/f_auto,q_auto/a')
  })

  it('should format sizes and suggest names from files', () => {
    expect(formatBytes(48_947)).toBe('47,8 KB')
    expect(formatBytes(3.5 * 1024 * 1024)).toBe('3,5 MB')
    expect(nameFromFile(new File([], 'mi_foto-de.verano.JPG'))).toBe('mi foto de.verano')
  })

  it('should fetch a page, leaving out empty parameters', async () => {
    mockedAxios.get.mockResolvedValue({ data: page([], 0) })

    await fetchLibraryPage('', null)
    expect(mockedAxios.get).toHaveBeenCalledWith('/api/admin/images/', { params: { q: undefined, cursor: undefined } })
    await fetchLibraryPage('sol', 'next')
    expect(mockedAxios.get).toHaveBeenLastCalledWith('/api/admin/images/', { params: { q: 'sol', cursor: 'next' } })
  })

  it('should get a signature and send the file straight to Cloudinary, reporting progress', async () => {
    mockedAxios.post
      .mockResolvedValueOnce({
        data: { url: 'https://api.cloudinary.com/upload', fields: { api_key: 'k', timestamp: 1 } },
      })
      .mockImplementationOnce(async (_url, _form, config) => {
        config!.onUploadProgress!({ loaded: 50, total: 200 } as never)
        config!.onUploadProgress!({ loaded: 0 } as never)
        return {
          data: {
            public_id: 'sol_1',
            width: 1,
            height: 1,
            format: 'png',
            bytes: 1,
            created_at: 'x',
            context: { custom: { name: 'Sol' } },
          },
        }
      })
    const onProgress = vi.fn()
    const file = new File(['x'], 'sol.png', { type: 'image/png' })

    await expect(uploadImage(file, { name: 'Sol', alt: '' }, onProgress)).resolves.toMatchObject({
      publicId: 'sol_1',
      name: 'Sol',
    })
    expect(mockedAxios.post).toHaveBeenNthCalledWith(1, '/api/admin/images/signature/', { name: 'Sol', alt: '' })
    const form = mockedAxios.post.mock.calls[1]![1] as FormData
    expect([...form.keys()]).toEqual(['api_key', 'timestamp', 'file'])
    expect(form.get('timestamp')).toBe('1')
    expect(onProgress.mock.calls).toEqual([[25], [0]])
  })

  it('should put a new image first in the unfiltered library only', () => {
    const queryClient = clientWith('', [page([image('a')], 2), page([image('b')], 2)])
    queryClient.setQueryData(libraryQueryKey('sol'), { pages: [page([], 0)], pageParams: [null] })

    addToLibrary(queryClient, image('n'))

    expect(imagesOf(queryClient, '')).toEqual([
      [3, ['n', 'a']],
      [2, ['b']],
    ])
    expect(imagesOf(queryClient, 'sol')).toEqual([[0, []]])
    expect(() => addToLibrary(new QueryClient(), image('n'))).not.toThrow()
  })

  it('should replace and remove images in every cached search', () => {
    const queryClient = clientWith('', [page([image('a'), image('b')], 2)])
    queryClient.setQueryData(libraryQueryKey('a'), { pages: [page([image('a')], 1)], pageParams: [null] })
    // A search still loading: in the cache, without data yet.
    queryClient.getQueryCache().build(queryClient, { queryKey: libraryQueryKey('loading') })

    replaceInLibrary(queryClient, image('a', 'A renamed'))
    expect(imagesOf(queryClient, '')).toEqual([[2, ['A renamed', 'b']]])
    expect(imagesOf(queryClient, 'a')).toEqual([[1, ['A renamed']]])

    removeFromLibrary(queryClient, 'a')
    expect(imagesOf(queryClient, '')).toEqual([[1, ['b']]])
    expect(imagesOf(queryClient, 'a')).toEqual([[0, []]])

    removeFromLibrary(queryClient, 'missing')
    expect(imagesOf(queryClient, '')).toEqual([[1, ['b']]])
    expect(imagesOf(queryClient, 'loading')).toBeUndefined()
  })
})
