import { algoliasearch } from 'algoliasearch'
import { describe, expect, it, vi } from 'vitest'

import { getAlgoliaClient } from './getAlgoliaClient'

vi.mock('algoliasearch', () => ({ algoliasearch: vi.fn(() => 'client') }))

describe('getAlgoliaClient', () => {
  it('should create a client with the configured credentials', () => {
    process.env.ALGOLIA_APPLICATION_ID = 'app-id'
    process.env.ALGOLIA_SEARCH_API_KEY = 'search-key'

    expect(getAlgoliaClient()).toBe('client')
    expect(algoliasearch).toHaveBeenCalledWith('app-id', 'search-key')
  })
})
