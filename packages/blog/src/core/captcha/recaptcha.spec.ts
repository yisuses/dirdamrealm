import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { verifyRecaptcha } from './recaptcha'

describe('verifyRecaptcha', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
    vi.stubEnv('RECAPTCHA_SECRET_KEY', 'secret')
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
    fetchMock.mockReset()
  })

  it("should post the answer and the visitor's address to Google", async () => {
    fetchMock.mockResolvedValue(Response.json({ success: true }))

    await expect(verifyRecaptcha('token', '1.2.3.4')).resolves.toBe(true)

    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe('https://www.google.com/recaptcha/api/siteverify')
    expect(init.method).toBe('POST')
    expect(Object.fromEntries(init.body as URLSearchParams)).toEqual({
      secret: 'secret',
      response: 'token',
      remoteip: '1.2.3.4',
    })
  })

  it('should leave the address out when unknown, and refuse what Google refuses', async () => {
    fetchMock.mockResolvedValue(Response.json({ success: false }))

    await expect(verifyRecaptcha('token')).resolves.toBe(false)
    expect(Object.fromEntries(fetchMock.mock.calls[0]![1].body as URLSearchParams)).toEqual({
      secret: 'secret',
      response: 'token',
    })
  })

  it('should refuse everything without a secret, without asking Google', async () => {
    vi.stubEnv('RECAPTCHA_SECRET_KEY', '')

    await expect(verifyRecaptcha('token')).resolves.toBe(false)
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
