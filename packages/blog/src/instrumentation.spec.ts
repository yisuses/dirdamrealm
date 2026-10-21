import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const sentry = vi.hoisted(() => ({ init: vi.fn(), captureRequestError: vi.fn() }))

vi.mock('@sentry/nextjs', () => sentry)

describe('instrumentation', () => {
  beforeEach(() => {
    vi.resetModules()
    sentry.init.mockClear()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('should load the server sentry config on the node runtime', async () => {
    vi.stubEnv('NEXT_RUNTIME', 'nodejs')
    const { register } = await import('./instrumentation')

    await register()

    expect(sentry.init).toHaveBeenCalledTimes(1)
    expect(sentry.init).toHaveBeenCalledWith(expect.objectContaining({ beforeSend: expect.any(Function) }))
  })

  it('should load the edge sentry config on the edge runtime', async () => {
    vi.stubEnv('NEXT_RUNTIME', 'edge')
    const { register } = await import('./instrumentation')

    await register()

    expect(sentry.init).toHaveBeenCalledTimes(1)
    expect(sentry.init).toHaveBeenCalledWith(expect.not.objectContaining({ beforeSend: expect.anything() }))
  })

  it('should load no sentry config on any other runtime', async () => {
    vi.stubEnv('NEXT_RUNTIME', '')
    const { register } = await import('./instrumentation')

    await register()

    expect(sentry.init).not.toHaveBeenCalled()
  })

  it('should capture nested server errors with sentry', async () => {
    const { onRequestError } = await import('./instrumentation')

    expect(onRequestError).toBe(sentry.captureRequestError)
  })
})
