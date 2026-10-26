import { afterEach, describe, expect, it, vi } from 'vitest'

describe('loginRatelimit', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('should be disabled without Upstash credentials, as in local development', async () => {
    vi.stubEnv('KV_REST_API_URL', '')
    vi.stubEnv('KV_REST_API_TOKEN', '')

    const { commentRatelimit, loginRatelimit, passwordResetRatelimit } = await import('./ratelimit')

    expect(loginRatelimit).toBeNull()
    expect(passwordResetRatelimit).toBeNull()
    expect(commentRatelimit).toBeNull()
  })

  it('should limit by sliding window when Upstash is configured', async () => {
    vi.stubEnv('KV_REST_API_URL', 'https://example.upstash.io')
    vi.stubEnv('KV_REST_API_TOKEN', 'token')

    const { commentRatelimit, loginRatelimit } = await import('./ratelimit')

    expect(commentRatelimit).not.toBeNull()
    expect(loginRatelimit).not.toBeNull()
    expect(typeof loginRatelimit?.limit).toBe('function')
  })
})
