import * as sentry from '@sentry/nextjs'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { verifyRecaptcha } from '@blog/core/captcha/recaptcha'
import { addComment } from '@blog/data'

import { POST } from './route'

const limiter = vi.hoisted(() => ({ current: null as null | { limit: ReturnType<typeof vi.fn> } }))

vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }))
vi.mock('@blog/core/captcha/recaptcha', () => ({ verifyRecaptcha: vi.fn(async () => true) }))
vi.mock('@blog/data', () => ({ addComment: vi.fn(async () => true) }))
vi.mock('@blog/core/ratelimit', () => ({
  get commentRatelimit() {
    return limiter.current
  },
}))

const comment = { postId: 1, author: 'Ana María', text: 'Muy bueno', captcha: 'token' }

const request = (body: unknown, headers?: HeadersInit) =>
  new Request('https://whemotion.com/api/addComment/', {
    method: 'POST',
    body: typeof body === 'string' ? body : JSON.stringify(body),
    headers,
  })

describe('POST /api/addComment', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    limiter.current = null
  })

  it("should save a valid comment after checking the visitor's captcha", async () => {
    const response = await POST(request(comment, new Headers([['x-forwarded-for', '1.2.3.4, 10.0.0.1']])))

    expect(response.status).toBe(200)
    expect(verifyRecaptcha).toHaveBeenCalledWith('token', '1.2.3.4')
    expect(addComment).toHaveBeenCalledWith({ postId: 1, author: 'Ana María', text: 'Muy bueno' })
  })

  it('should limit comments per address, counting unknown addresses together', async () => {
    limiter.current = {
      limit: vi.fn().mockResolvedValueOnce({ success: true }).mockResolvedValueOnce({ success: false }),
    }

    expect((await POST(request(comment))).status).toBe(200)
    expect(verifyRecaptcha).toHaveBeenCalledWith('token', undefined)
    const limited = await POST(request(comment, new Headers([['x-forwarded-for', '5.6.7.8']])))

    expect(limited.status).toBe(429)
    expect(limiter.current.limit.mock.calls).toEqual([['unknown'], ['5.6.7.8']])
    expect(addComment).toHaveBeenCalledTimes(1)
  })

  it('should reject missing or invalid fields and bodies that are not json', async () => {
    for (const body of [{ ...comment, captcha: '' }, { ...comment, author: 'Ana' }, { postId: 'x' }, 'not json']) {
      const response = await POST(request(body))
      expect(response.status).toBe(422)
    }
    expect(verifyRecaptcha).not.toHaveBeenCalled()
  })

  it('should reject an invalid captcha', async () => {
    vi.mocked(verifyRecaptcha).mockResolvedValueOnce(false)

    const response = await POST(request(comment))

    expect(response.status).toBe(422)
    await expect(response.json()).resolves.toEqual({ message: 'Unproccesable request, Invalid captcha code' })
    expect(addComment).not.toHaveBeenCalled()
  })

  it('should answer 404 for a post that is not published', async () => {
    vi.mocked(addComment).mockResolvedValueOnce(false)

    expect((await POST(request(comment))).status).toBe(404)
  })

  it('should report failures', async () => {
    vi.mocked(addComment).mockRejectedValueOnce(new Error('down'))

    const response = await POST(request(comment))

    expect(response.status).toBe(422)
    await expect(response.json()).resolves.toEqual({ message: 'Something went wrong' })
    expect(sentry.captureException).toHaveBeenCalled()
  })
})
