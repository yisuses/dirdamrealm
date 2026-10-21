import { afterEach, describe, expect, it, vi } from 'vitest'

const sentry = vi.hoisted(() => ({ init: vi.fn() }))

vi.mock('@sentry/nextjs', () => sentry)

describe('sentry edge config', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('should init sentry with the dsn and full tracing', async () => {
    vi.stubEnv('NEXTJS_SENTRY_DSN', 'https://dsn.sentry.io/1')

    await import('./sentry.edge.config')

    expect(sentry.init).toHaveBeenCalledWith({ dsn: 'https://dsn.sentry.io/1', tracesSampleRate: 1.0 })
  })
})
