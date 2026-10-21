import axios from 'axios'
import { type Mocked, afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { getLatestPosts } from './getLatestPosts'
import { postResponseEnMock, postResponseEsMock } from './post.mock'

vi.mock('axios')
const mockedAxios = axios as Mocked<typeof axios>

const requestedUrl = (call = 0) => decodeURIComponent(mockedAxios.get.mock.calls[call]![0] as string)

describe('getLatestPosts', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.clearAllMocks()
  })

  it('should fetch every locale and sort the posts by publication date', async () => {
    const older = { ...postResponseEsMock, id: 1, publishedAt: '2026-01-01T00:00:00.000Z' }
    const newer = { ...postResponseEnMock, id: 2, publishedAt: '2026-02-01T00:00:00.000Z' }
    mockedAxios.get
      .mockResolvedValueOnce({ data: { data: [older] } })
      .mockResolvedValueOnce({ data: { data: [newer] } })

    const posts = await getLatestPosts({})

    expect(posts?.map(({ id }) => id)).toEqual([2, 1])
    expect(mockedAxios.get).toHaveBeenCalledTimes(2)
    expect(requestedUrl(0)).toContain('locale=es')
    expect(requestedUrl(1)).toContain('locale=en')
    expect(requestedUrl(0)).toContain('pagination[pageSize]=100')
    expect(requestedUrl(0)).toContain('populate[localizations]=true')
    expect(requestedUrl(0)).not.toContain('filters')
  })

  it('should apply the category, limit and populate options', async () => {
    mockedAxios.get.mockResolvedValue({ data: { data: [] } })

    await getLatestPosts({ category: 'ENG', limit: 3, populate: ['coverImage'] })

    expect(requestedUrl()).toContain('filters[categories][code]=ENG')
    expect(requestedUrl()).toContain('pagination[pageSize]=3')
    expect(requestedUrl()).toContain('populate[coverImage]=true')
    expect(requestedUrl()).not.toContain('populate[localizations]')
  })

  it('should keep one post per localization group in the requested locale', async () => {
    mockedAxios.get
      .mockResolvedValueOnce({ data: { data: [postResponseEsMock] } })
      .mockResolvedValueOnce({ data: { data: [postResponseEnMock] } })

    const posts = await getLatestPosts({ locale: 'en' })

    expect(posts?.every(post => post.locale === 'en' || !post.localizations?.length)).toBe(true)
  })

  it('should throw when a request fails', async () => {
    mockedAxios.get.mockRejectedValue(new Error('network'))

    await expect(getLatestPosts({})).rejects.toThrow('Error retrieving latest posts.')
  })
})
