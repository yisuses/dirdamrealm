import { type MockedFunction, beforeEach, describe, expect, it, vi } from 'vitest'

import { getCategories } from '@blog/api'
import { getAllPosts } from '@blog/api/post'

import { GET, dynamic, revalidate } from './route'

vi.mock('@blog/api', () => ({ getCategories: vi.fn() }))
vi.mock('@blog/api/post', () => ({ getAllPosts: vi.fn() }))

const mockedGetCategories = getCategories as MockedFunction<typeof getCategories>
const mockedGetAllPosts = getAllPosts as MockedFunction<typeof getAllPosts>

describe('GET /sitemap.xml', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedGetAllPosts.mockResolvedValue([{ id: 7, updatedAt: '2026-10-20T11:30:00.000Z' } as Post])
    mockedGetCategories.mockResolvedValue([{ code: 'TRAVEL', updatedAt: '2026-10-01T08:00:00.000Z' } as Category])
  })

  it('should be static and revalidate once a day as a backstop', () => {
    expect(dynamic).toBe('force-static')
    expect(revalidate).toBe(86400)
  })

  it('should list the page, post and category sitemaps', async () => {
    const response = await GET()

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('text/xml')
    expect(mockedGetAllPosts).toHaveBeenCalledWith({})
    expect(mockedGetCategories).toHaveBeenCalledWith({ sort: ['updatedAt:desc'] })
    expect(await response.text()).toMatchSnapshot()
  })

  it('should leave the post dates empty when the latest post has no update date', async () => {
    mockedGetAllPosts.mockResolvedValue([{ id: 7 } as Post])

    const xml = await (await GET()).text()

    expect(xml.match(/<lastmod>[^<]*<\/lastmod>/g)).toEqual([
      '<lastmod>2026-10-01T08:00:00.000Z</lastmod>',
      '<lastmod>2026-10-01T08:00:00.000Z</lastmod>',
      '<lastmod></lastmod>',
    ])
  })

  it('should leave the post dates empty when there are no posts', async () => {
    mockedGetAllPosts.mockResolvedValue(null as unknown as Post[])

    const xml = await (await GET()).text()

    expect(xml).toContain('<lastmod></lastmod>')
  })
})
