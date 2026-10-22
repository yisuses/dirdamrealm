import { type MockedFunction, beforeEach, describe, expect, it, vi } from 'vitest'

import { getAllPosts } from '@blog/data'

import { GET, dynamic, revalidate } from './route'

vi.mock('@blog/data', () => ({ getAllPosts: vi.fn() }))

const mockedGetAllPosts = getAllPosts as MockedFunction<typeof getAllPosts>

describe('GET /sitemap/page.xml', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedGetAllPosts.mockResolvedValue([{ id: 7, updatedAt: '2026-10-20T11:30:00.000Z' } as Post])
  })

  it('should be static and revalidate once a day as a backstop', () => {
    expect(dynamic).toBe('force-static')
    expect(revalidate).toBe(86400)
  })

  it('should list the home page dated by the latest post', async () => {
    const response = await GET()

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('text/xml')
    expect(mockedGetAllPosts).toHaveBeenCalledWith({})
    expect(await response.text()).toMatchSnapshot()
  })

  it('should leave the date empty when the latest post has no update date', async () => {
    mockedGetAllPosts.mockResolvedValue([{ id: 7 } as Post])

    expect(await (await GET()).text()).toContain('<lastmod></lastmod>')
  })

  it('should leave the date empty when there are no posts', async () => {
    mockedGetAllPosts.mockResolvedValue(null as unknown as Post[])

    expect(await (await GET()).text()).toContain('<lastmod></lastmod>')
  })
})
