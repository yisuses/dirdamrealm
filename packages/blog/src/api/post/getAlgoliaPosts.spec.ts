import { describe, expect, it, vi } from 'vitest'

import { getAlgoliaClient } from '@blog/api/algoliaClient'
import { algoliaPostMapper } from '@blog/api/mapper/postMapper/postMapper'

import { getAlgoliaPosts } from './getAlgoliaPosts'

vi.mock('@blog/api/algoliaClient', () => ({ getAlgoliaClient: vi.fn() }))

const hit = { objectID: '7', title: 'Hola', locale: 'es', categories: null } as unknown as AlgoliaPostEntity

describe('getAlgoliaPosts', () => {
  it('should search the post index and map the hits', async () => {
    const searchSingleIndex = vi.fn().mockResolvedValue({ hits: [hit] })
    vi.mocked(getAlgoliaClient).mockReturnValue({ searchSingleIndex } as unknown as ReturnType<typeof getAlgoliaClient>)

    const [post] = await getAlgoliaPosts({ query: 'hola' })

    expect(post).toEqual({ ...algoliaPostMapper(hit), content: expect.any(Object) })
    expect(searchSingleIndex).toHaveBeenCalledWith({
      indexName: expect.stringMatching(/_post$/),
      searchParams: { query: 'hola' },
    })
  })
})
