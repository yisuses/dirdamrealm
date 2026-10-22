import { revalidatePath } from 'next/cache'
import { after } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { revalidatePublicContent } from './revalidatePublicContent'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('next/server', () => ({ after: vi.fn() }))

describe('revalidatePublicContent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should expire every public page and the sitemaps, then warm the home and archive pages', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(new Response())

    revalidatePublicContent({ warm: ['/category/TRA/viajes/'] })

    expect(vi.mocked(revalidatePath).mock.calls).toEqual([
      ['/[lng]', 'layout'],
      ['/sitemap.xml'],
      ['/sitemap/post.xml'],
      ['/sitemap/page.xml'],
      ['/sitemap/category.xml'],
    ])
    expect(fetchSpy).not.toHaveBeenCalled()

    await (vi.mocked(after).mock.calls[0]![0] as () => Promise<unknown>)()
    expect(fetchSpy.mock.calls.map(([url]) => url)).toEqual([
      'https://example.com/',
      'https://example.com/archive/',
      'https://example.com/en/',
      'https://example.com/en/archive/',
      'https://example.com/category/TRA/viajes/',
    ])
    fetchSpy.mockRestore()
  })

  it('should warm only the home and archive pages by default', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(new Response())

    revalidatePublicContent()
    await (vi.mocked(after).mock.calls[0]![0] as () => Promise<unknown>)()

    expect(fetchSpy).toHaveBeenCalledTimes(4)
    fetchSpy.mockRestore()
  })
})
