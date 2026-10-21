import axios from 'axios'
import { type Mocked, afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { getAllPosts, postResponseEnMock, postResponseEsMock } from '@blog/api/post'

vi.mock('axios')
const mockedAxios = axios as Mocked<typeof axios>

const requestedUrl = () => decodeURIComponent(mockedAxios.get.mock.calls[0]![0] as string)

describe('getAllPosts', () => {
  beforeEach(() => {
    mockedAxios.get.mockResolvedValue({ data: { data: [postResponseEnMock] } })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('maps the posts returned by the API', async () => {
    // getAllPosts fetches each locale separately (Strapi v5 populates `localizations`
    // only for single-locale queries); mock one locale with the post, the other empty.
    mockedAxios.get
      .mockResolvedValueOnce({ data: { data: [postResponseEnMock] } })
      .mockResolvedValueOnce({ data: { data: [] } })

    const posts = await getAllPosts({})

    expect(posts).toHaveLength(1)
    expect(posts?.[0]).toMatchObject({
      id: postResponseEnMock.id,
      title: postResponseEnMock.title,
    })
  })

  it('does not add a category filter when none is provided', async () => {
    await getAllPosts({})

    expect(requestedUrl()).not.toContain('filters')
  })

  it('filters by category code when a category is provided', async () => {
    await getAllPosts({ category: 'ENG' })

    expect(requestedUrl()).toContain('filters[categories][code]=ENG')
  })

  it('sorts the posts of every locale by update date, undated last', async () => {
    mockedAxios.get
      .mockResolvedValueOnce({ data: { data: [{ ...postResponseEsMock, id: 1, updatedAt: undefined }] } })
      .mockResolvedValueOnce({
        data: {
          data: [
            { ...postResponseEnMock, id: 2, updatedAt: '2026-01-01T00:00:00.000Z' },
            { ...postResponseEnMock, id: 3, updatedAt: undefined },
          ],
        },
      })

    const posts = await getAllPosts({})

    expect(posts?.map(({ id }) => id)).toEqual([2, 1, 3])
  })

  it('keeps one post per localization group in the requested locale', async () => {
    mockedAxios.get
      .mockResolvedValueOnce({ data: { data: [postResponseEsMock] } })
      .mockResolvedValueOnce({ data: { data: [postResponseEnMock] } })

    const posts = await getAllPosts({ locale: 'en' })

    expect(posts?.every(post => post.locale === 'en' || !post.localizations?.length)).toBe(true)
  })

  it('throws when a request fails', async () => {
    vi.spyOn(console, 'error').mockImplementationOnce(() => undefined)
    mockedAxios.get.mockRejectedValue(new Error('network'))

    await expect(getAllPosts({})).rejects.toThrow('Error retrieving posts.')
  })
})
