import type { init } from '@sentry/nextjs'
import { afterEach, describe, expect, it, vi } from 'vitest'

import './sentry.server.config'

const sentry = vi.hoisted(() => {
  process.env.NEXTJS_SENTRY_DSN = 'https://dsn.sentry.io/1'
  return { init: vi.fn() }
})

vi.mock('@sentry/nextjs', () => sentry)

type Options = NonNullable<Parameters<typeof init>[0]>
type BeforeSend = NonNullable<Options['beforeSend']>

describe('sentry server config', () => {
  // Captured at collection time: init runs on module load, before any test.
  const options: Options = sentry.init.mock.calls[0][0]
  const beforeSend = options.beforeSend!
  const event = { message: 'boom' } as Parameters<BeforeSend>[0]
  const hint = { originalException: 'boom' }

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('should init sentry with the dsn and full tracing', () => {
    expect(options).toEqual({
      dsn: 'https://dsn.sentry.io/1',
      tracesSampleRate: 1.0,
      beforeSend: expect.any(Function),
    })
  })

  it('should log and send events in development', () => {
    vi.stubEnv('NODE_ENV', 'development')
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined)

    expect(beforeSend(event, hint)).toBe(event)
    expect(log).toHaveBeenCalledWith('Sentry event', event)
    expect(log).toHaveBeenCalledWith('Sentry hint', hint)
  })

  it('should send events silently elsewhere', () => {
    vi.stubEnv('NODE_ENV', 'production')
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined)

    expect(beforeSend(event, hint)).toBe(event)
    expect(log).not.toHaveBeenCalled()
  })
})
