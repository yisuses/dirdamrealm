import * as sentry from '@sentry/nextjs'
import axios from 'axios'
import { type Mocked, beforeEach, describe, expect, it, vi } from 'vitest'

import { addComment } from '@blog/api/comment'

import { POST } from './route'

vi.mock('axios')
vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }))
vi.mock('@blog/api/comment', () => ({ addComment: vi.fn() }))

const mockedAxios = axios as Mocked<typeof axios>

const comment = { postId: 1, author: 'Ana', text: 'Hola', captcha: 'token' }

const request = (body: unknown) =>
  new Request('https://whemotion.com/api/addComment/', { method: 'POST', body: JSON.stringify(body) })

describe('POST /api/addComment', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.RECAPTCHA_SECRET_KEY = 'secret'
  })

  it('should save the comment when the captcha is valid', async () => {
    mockedAxios.post.mockResolvedValue({ data: { success: true } })

    const response = await POST(request(comment))

    expect(response.status).toBe(200)
    expect(mockedAxios.post.mock.calls[0]![0]).toBe(
      'https://www.google.com/recaptcha/api/siteverify?secret=secret&response=token',
    )
    expect(addComment).toHaveBeenCalledWith({ postId: 1, author: 'Ana', text: 'Hola' })
  })

  it('should reject a request with missing fields', async () => {
    const response = await POST(request({ ...comment, captcha: '' }))

    expect(response.status).toBe(422)
    expect(mockedAxios.post).not.toHaveBeenCalled()
  })

  it('should reject a body that is not json', async () => {
    const response = await POST(new Request('https://whemotion.com/api/addComment/', { method: 'POST', body: 'x' }))

    expect(response.status).toBe(422)
  })

  it('should reject an invalid captcha', async () => {
    mockedAxios.post.mockResolvedValue({ data: { success: false } })

    const response = await POST(request(comment))

    expect(response.status).toBe(422)
    await expect(response.json()).resolves.toEqual({ message: 'Unproccesable request, Invalid captcha code' })
    expect(addComment).not.toHaveBeenCalled()
  })

  it('should report and reject when saving fails', async () => {
    const error = new Error('strapi down')
    mockedAxios.post.mockResolvedValue({ data: { success: true } })
    vi.mocked(addComment).mockRejectedValue(error)

    const response = await POST(request(comment))

    expect(response.status).toBe(422)
    expect(sentry.captureException).toHaveBeenCalledWith(error)
  })
})
