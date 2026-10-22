import axios from 'axios'
import { type Mocked, beforeEach, describe, expect, it, vi } from 'vitest'

import { getAllPosts, getCategories, getComments, getLatestPosts, searchPosts } from '.'

vi.mock('axios')
const mockedAxios = axios as Mocked<typeof axios>

describe('public fetchers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedAxios.get.mockResolvedValue({ data: ['result'] })
  })

  it('should read every resource through the site endpoints, with the trailing slash the site requires', async () => {
    await expect(getCategories({ locale: 'es', code: 'TRA' })).resolves.toEqual(['result'])
    await getLatestPosts({ locale: 'en', category: 'MAC', limit: 16 })
    await getAllPosts({ locale: 'es' })
    await getComments({ ids: [1, 2] })
    await searchPosts({ query: 'música' })

    expect(mockedAxios.get.mock.calls).toEqual([
      ['/api/public/categories/', { params: { locale: 'es', code: 'TRA' } }],
      ['/api/public/posts/latest/', { params: { locale: 'en', category: 'MAC', limit: 16 } }],
      ['/api/public/posts/', { params: { locale: 'es', category: undefined } }],
      ['/api/public/comments/', { params: { ids: '1,2' } }],
      ['/api/public/search/', { params: { q: 'música' } }],
    ])
  })

  it('should send no ids when there are none', async () => {
    await getComments({})

    expect(mockedAxios.get).toHaveBeenCalledWith('/api/public/comments/', { params: { ids: '' } })
  })
})
