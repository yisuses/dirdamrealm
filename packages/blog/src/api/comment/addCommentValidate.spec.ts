import axios from 'axios'
import { type Mocked, afterEach, describe, expect, it, vi } from 'vitest'

import { addCommentValidate } from './addCommentValidate'

vi.mock('axios')
const mockedAxios = axios as Mocked<typeof axios>

const comment = { postId: 1, author: 'Ana', text: 'Hola', captcha: 'token' }

describe('addCommentValidate', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should send the comment to the validation route', async () => {
    mockedAxios.post.mockResolvedValue({ status: 200 })

    await expect(addCommentValidate(comment)).resolves.toEqual({ status: 'OK' })
    expect(mockedAxios.post).toHaveBeenCalledWith('/api/addComment/', comment)
  })

  it('should throw when the validation fails', async () => {
    mockedAxios.post.mockRejectedValue(new Error('422'))

    await expect(addCommentValidate(comment)).rejects.toThrow('Error validating comment.')
  })
})
