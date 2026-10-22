import { type MockedFunction, beforeEach, describe, expect, it, vi } from 'vitest'

import { getAllPosts } from '@blog/data'

import { GET, dynamic, revalidate } from './route'

vi.mock('@blog/data', () => ({ getAllPosts: vi.fn() }))

const mockedGetAllPosts = getAllPosts as MockedFunction<typeof getAllPosts>

const coverImage = { url: '/media/original.jpg', formats: { small: { url: '/media/small.jpg' } } } as unknown as Media

const post = (id: number, title: string, locale: AppLocales, extra: Partial<Post> = {}) =>
  ({
    id,
    title,
    locale,
    publishedAt: '2026-10-20T11:30:00.000Z',
    updatedAt: '2026-10-21T08:00:00.000Z',
    coverImage: null,
    localizations: null,
    ...extra,
  }) as Post

describe('GET /sitemap/post.xml', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should be static and revalidate once a day as a backstop', () => {
    expect(dynamic).toBe('force-static')
    expect(revalidate).toBe(86400)
  })

  it('should list every post with its cover image and alternates', async () => {
    mockedGetAllPosts.mockResolvedValue([
      post(7, 'Hola Mundo', 'es', { coverImage, localizations: [post(8, 'Hello World', 'en')] }),
      post(8, 'Hello World', 'en', { localizations: [post(7, 'Hola Mundo', 'es')] }),
      post(9, 'Solo en español', 'es', { localizations: [] }),
    ])

    const response = await GET()

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('text/xml')
    expect(mockedGetAllPosts).toHaveBeenCalledWith({})
    expect(await response.text()).toMatchSnapshot()
  })

  it('should leave out the image of a post without cover and declare every prefix it uses', async () => {
    mockedGetAllPosts.mockResolvedValue([post(9, 'Solo en español', 'es')])

    const xml = await (await GET()).text()

    expect(xml).not.toContain('null')
    expect(xml).not.toContain('<image:image>')
    // An undeclared prefix makes the whole sitemap malformed XML.
    const usedPrefixes = new Set([...xml.matchAll(/<\/?(\w+):\w+/g)].map(([, prefix]) => prefix))
    usedPrefixes.forEach(prefix => expect(xml).toContain(`xmlns:${prefix}=`))
  })

  it('should return an empty url set when there are no posts', async () => {
    mockedGetAllPosts.mockResolvedValue(null as unknown as Post[])

    const xml = await (await GET()).text()

    expect(xml).toContain('<urlset')
    expect(xml).not.toContain('<url>')
  })
})
