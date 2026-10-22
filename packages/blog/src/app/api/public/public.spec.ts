import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getAllPosts, getCategories, getComments, getLatestPosts, searchPosts } from '@blog/data'

import { GET as categories } from './categories/route'
import { GET as comments } from './comments/route'
import { GET as latest } from './posts/latest/route'
import { GET as all } from './posts/route'
import { GET as search } from './search/route'

vi.mock('@blog/data', () => ({
  getCategories: vi.fn(async () => ['categories']),
  getLatestPosts: vi.fn(async () => ['latest']),
  getAllPosts: vi.fn(async () => ['all']),
  getComments: vi.fn(async () => ['comments']),
  searchPosts: vi.fn(async () => ['search']),
}))

const request = (query: string) => new Request(`https://whemotion.com/api/public/x/?${query}`)
const cdnCached = 'public, s-maxage=300, stale-while-revalidate=86400'

describe('public read endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should serve categories, cached by the CDN', async () => {
    const response = await categories(request('locale=es&code=TRA'))

    await expect(response.json()).resolves.toEqual(['categories'])
    expect(response.headers.get('Cache-Control')).toBe(cdnCached)
    expect(getCategories).toHaveBeenCalledWith({ locale: 'es', code: 'TRA' })
  })

  it('should serve the latest and all posts with validated filters', async () => {
    await expect((await latest(request('locale=en&category=MAC&limit=16'))).json()).resolves.toEqual(['latest'])
    await expect((await all(request('locale=es&category=TRA'))).json()).resolves.toEqual(['all'])

    expect(getLatestPosts).toHaveBeenCalledWith({ locale: 'en', category: 'MAC', limit: 16 })
    expect(getAllPosts).toHaveBeenCalledWith({ locale: 'es', category: 'TRA' })
  })

  it('should ignore parameters that are not valid instead of passing them on', async () => {
    await latest(request('locale=fr&category=music&limit=500'))
    await latest(request('limit=-1'))
    await latest(request('limit=2.5'))

    expect(vi.mocked(getLatestPosts).mock.calls).toEqual([
      [{ locale: undefined, category: undefined, limit: undefined }],
      [{ locale: undefined, category: undefined, limit: undefined }],
      [{ locale: undefined, category: undefined, limit: undefined }],
    ])
  })

  it('should serve comments uncached, so a new one shows right away', async () => {
    const response = await comments(request('ids=7,8,x,-1'))

    await expect(response.json()).resolves.toEqual(['comments'])
    expect(response.headers.get('Cache-Control')).toBe('no-store')
    expect(getComments).toHaveBeenCalledWith({ ids: [7, 8] })
  })

  it('should not query comments without valid ids, and cap how many are asked for', async () => {
    await expect((await comments(request(''))).json()).resolves.toEqual([])
    expect(getComments).not.toHaveBeenCalled()

    await comments(request(`ids=${Array.from({ length: 30 }, (_, i) => i + 1).join(',')}`))
    expect(vi.mocked(getComments).mock.calls[0]![0].ids).toHaveLength(20)
  })

  it('should search with a bounded query and skip empty ones', async () => {
    await expect((await search(request(`q=${'a'.repeat(150)}`))).json()).resolves.toEqual(['search'])
    expect(searchPosts).toHaveBeenCalledWith({ query: 'a'.repeat(100) })

    await expect((await search(request('q=%20%20'))).json()).resolves.toEqual([])
    await expect((await search(request(''))).json()).resolves.toEqual([])
    expect(searchPosts).toHaveBeenCalledTimes(1)
  })
})
