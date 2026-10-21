import axios from 'axios'
import { type Mocked, afterEach, describe, expect, it, vi } from 'vitest'

import { addComment } from './addComment'

vi.mock('axios')
const mockedAxios = axios as Mocked<typeof axios>

describe('addComment', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should post the comment to Strapi', async () => {
    mockedAxios.post.mockResolvedValue({ status: 200 })

    await expect(addComment({ postId: 1, author: 'Ana', text: 'Hola' })).resolves.toEqual({ status: 200 })
    expect(mockedAxios.post).toHaveBeenCalledWith('https://api.com/api/comments', {
      data: { post: 1, author: 'Ana', text: 'Hola' },
    })
  })

  it('should throw when the request fails', async () => {
    mockedAxios.post.mockRejectedValue(new Error('network'))

    await expect(addComment({ postId: 1, author: 'Ana', text: 'Hola' })).rejects.toThrow('Error adding comment.')
  })
})
