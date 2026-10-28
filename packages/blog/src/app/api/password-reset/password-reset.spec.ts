import { checkBotId } from 'botid/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createPasswordResetToken, resetPassword } from '@blog/core/auth/passwordReset'
import { sendEmail } from '@blog/core/email/send'
import { getActiveUserByEmail } from '@blog/db/queries/users'

import { POST as confirm } from './confirm/route'
import { POST as requestReset } from './request/route'

const limiter = vi.hoisted(() => ({ current: null as null | { limit: ReturnType<typeof vi.fn> } }))

vi.mock('@blog/core/ratelimit', () => ({
  get passwordResetRatelimit() {
    return limiter.current
  },
}))
vi.mock('@blog/core/auth/passwordReset', () => ({
  createPasswordResetToken: vi.fn(async () => 'tok3n'),
  resetPassword: vi.fn(async () => true),
}))
vi.mock('@blog/core/auth/passwords', () => ({ hashPassword: vi.fn(async () => 'hashed') }))
vi.mock('@blog/core/email/send', async importOriginal => ({
  ...(await importOriginal<typeof import('@blog/core/email/send')>()),
  sendEmail: vi.fn(async () => true),
}))
vi.mock('@blog/db/queries/users', () => ({ getActiveUserByEmail: vi.fn() }))
vi.mock('botid/server', () => ({ checkBotId: vi.fn() }))

const post = (body: unknown, headers?: HeadersInit) =>
  new Request('https://evil.example/api/password-reset/x/', {
    method: 'POST',
    headers,
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })

describe('password reset API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    limiter.current = null
    vi.mocked(checkBotId).mockResolvedValue({ isBot: false } as never)
  })

  it.each([
    ['request', requestReset, { email: 'jose@example.com' }],
    ['confirm', confirm, { token: 'tok3n', password: 'una-clave-larga-123' }],
  ])('should refuse a bot on %s, before doing anything', async (_, handler, body) => {
    vi.mocked(checkBotId).mockResolvedValue({ isBot: true } as never)

    const response = await handler(post(body))

    expect(response.status).toBe(403)
    expect(await response.json()).toEqual({
      error: 'No se ha podido comprobar que eres una persona. Recarga la página y vuelve a probar.',
    })
    expect(getActiveUserByEmail).not.toHaveBeenCalled()
    expect(resetPassword).not.toHaveBeenCalled()
  })

  it('should email a link built on the site address, not the request host', async () => {
    vi.mocked(getActiveUserByEmail).mockResolvedValue({ id: 'u1', name: 'Ana', email: 'ana@example.com' } as never)

    const response = await requestReset(post({ email: ' ANA@example.com ' }))

    await expect(response.json()).resolves.toEqual({ ok: true })
    expect(getActiveUserByEmail).toHaveBeenCalledWith('ana@example.com')
    expect(createPasswordResetToken).toHaveBeenCalledWith('u1')
    const [email] = vi.mocked(sendEmail).mock.calls[0]!
    expect(email.to).toBe('ana@example.com')
    expect(email.text).toContain('https://example.com/admin/nueva-contrasena/?token=tok3n')
    expect(email.text).not.toContain('evil.example')
  })

  it('should answer the same for an unknown email, without sending anything', async () => {
    vi.mocked(getActiveUserByEmail).mockResolvedValue(undefined as never)

    await expect((await requestReset(post({ email: 'nadie@example.com' }))).json()).resolves.toEqual({ ok: true })
    expect(sendEmail).not.toHaveBeenCalled()
  })

  it('should reject invalid requests and limit how often they can be made', async () => {
    expect((await requestReset(post('{'))).status).toBe(400)
    expect((await requestReset(post({ email: 'nope' }))).status).toBe(400)

    limiter.current = { limit: vi.fn().mockResolvedValue({ success: false }) }
    expect(
      (await requestReset(post({ email: 'ana@example.com' }, new Headers([['x-forwarded-for', '1.2.3.4']])))).status,
    ).toBe(429)
    expect(limiter.current.limit).toHaveBeenCalledWith('1.2.3.4')

    limiter.current = { limit: vi.fn().mockResolvedValue({ success: true }) }
    vi.mocked(getActiveUserByEmail).mockResolvedValue(undefined as never)
    expect((await requestReset(post({ email: 'ana@example.com' }))).status).toBe(200)
    expect(limiter.current.limit).toHaveBeenCalledWith('unknown')
  })

  it('should set the new password with a valid link', async () => {
    const response = await confirm(
      post({ token: 'tok3n', password: 'clave-larga-1', passwordConfirm: 'clave-larga-1' }),
    )

    expect(response.status).toBe(200)
    expect(resetPassword).toHaveBeenCalledWith('tok3n', 'hashed')
  })

  it('should explain an expired or used link and reject invalid bodies', async () => {
    vi.mocked(resetPassword).mockResolvedValueOnce(false)
    const gone = await confirm(post({ token: 'old', password: 'clave-larga-1', passwordConfirm: 'clave-larga-1' }))

    expect(gone.status).toBe(410)
    await expect(gone.json()).resolves.toMatchObject({ error: expect.stringContaining('ha caducado o ya se usó') })
    expect((await confirm(post({ token: 'x', password: 'corta', passwordConfirm: 'corta' }))).status).toBe(400)
    expect((await confirm(post('{'))).status).toBe(400)
  })
})
