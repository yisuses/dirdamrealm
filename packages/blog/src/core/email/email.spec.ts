import * as sentry from '@sentry/nextjs'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { passwordResetEmail } from './passwordResetEmail'

const send = vi.hoisted(() => vi.fn())
vi.mock('resend', () => ({
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Resend: vi.fn(function Resend() {
    return { emails: { send } }
  }),
}))
vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }))

const email = { to: 'jose@example.com', subject: 'Hola', html: '<p>Hola</p>', text: 'Hola' }

describe('sendEmail', () => {
  beforeEach(() => {
    vi.resetModules()
    send.mockReset()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('should send through Resend from the configured address', async () => {
    vi.stubEnv('RESEND_API_KEY', 're_key')
    vi.stubEnv('RESEND_FROM_EMAIL', 'Whe <no-reply@whemotion.com>')
    send.mockResolvedValue({ error: null })
    const { sendEmail } = await import('./send')

    await expect(sendEmail(email)).resolves.toBe(true)
    expect(send).toHaveBeenCalledWith({ from: 'Whe <no-reply@whemotion.com>', ...email })
  })

  it('should report a Resend error and say it was not sent', async () => {
    vi.stubEnv('RESEND_API_KEY', 're_key')
    vi.stubEnv('RESEND_FROM_EMAIL', 'Whe <no-reply@whemotion.com>')
    send.mockResolvedValue({ error: { message: 'invalid' } })
    const { sendEmail } = await import('./send')

    await expect(sendEmail(email)).resolves.toBe(false)
    expect(sentry.captureException).toHaveBeenCalledWith({ message: 'invalid' })
  })

  it('should only log when Resend is not configured, as in local development', async () => {
    vi.stubEnv('RESEND_API_KEY', '')
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const { sendEmail } = await import('./send')

    await expect(sendEmail(email)).resolves.toBe(false)
    expect(warn).toHaveBeenCalledWith('Email not sent (Resend is not configured): "Hola" to jose@example.com')
    expect(send).not.toHaveBeenCalled()
    warn.mockRestore()
  })

  it('should also skip sending without a from address', async () => {
    vi.stubEnv('RESEND_API_KEY', 're_key')
    vi.stubEnv('RESEND_FROM_EMAIL', '')
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const { sendEmail } = await import('./send')

    await expect(sendEmail(email)).resolves.toBe(false)
  })
})

describe('email content', () => {
  it('should escape HTML in whatever people typed', async () => {
    const { escapeHtml } = await import('./send')

    expect(escapeHtml(`<b>"Ana" & 'Luis'</b>`)).toBe('&#60;b&#62;&#34;Ana&#34; &#38; &#39;Luis&#39;&#60;/b&#62;')
  })

  it('should build the password reset email in Spanish with the link, escaped', () => {
    const { subject, text, html } = passwordResetEmail({
      name: 'José <script>',
      link: 'https://whemotion.com/x?a=1&b=2',
    })

    expect(subject).toBe('Emoción Blanca: cambia tu contraseña del panel')
    expect(text).toContain('Hola, José <script>:')
    expect(text).toContain('https://whemotion.com/x?a=1&b=2')
    expect(html).toContain('Hola, José &#60;script&#62;:')
    expect(html).toContain('href="https://whemotion.com/x?a=1&#38;b=2"')
    expect(html).not.toContain('<script>')
  })
})
