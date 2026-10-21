import axios from 'axios'
import { type Mocked, afterEach, describe, expect, it, vi } from 'vitest'

import { getPostById } from './getPostById'
import { postMock, postResponseEnMock } from './post.mock'

vi.mock('axios')
const mockedAxios = axios as Mocked<typeof axios>

describe('getPostById', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should look the post up by numeric id in every locale', async () => {
    mockedAxios.get.mockResolvedValue({ data: { data: [postResponseEnMock] } })

    await expect(getPostById({ id: 42 })).resolves.toEqual(postMock)
    const url = decodeURIComponent(mockedAxios.get.mock.calls[0]![0] as string)
    expect(url).toContain('filters[id][$eq]=42')
    expect(url).toContain('locale=*')
  })

  it('should return undefined when no post matches', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { data: [] } }).mockResolvedValueOnce({ data: {} })

    await expect(getPostById({ id: 42 })).resolves.toBeUndefined()
    await expect(getPostById({ id: 42 })).resolves.toBeUndefined()
  })

  it('should throw when the request fails', async () => {
    mockedAxios.get.mockRejectedValue(new Error('network'))

    await expect(getPostById({ id: 42 })).rejects.toThrow('Error retrieving post with id 42.')
  })
})
