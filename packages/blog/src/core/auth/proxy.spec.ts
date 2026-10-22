import { NextRequest, NextResponse } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { guardAdmin, isAdminPath, isLoginAttempt, limitLoginAttempts, withoutSessionRefresh } from './proxy'

const mocks = vi.hoisted(() => ({
  session: null as null | { user: { name: string } },
  limit: vi.fn(),
  ratelimit: { current: null as null | { limit: ReturnType<typeof vi.fn> } },
}))

// Auth.js decodes the cookie; the tests choose what it finds.
vi.mock('next-auth', () => ({
  default: () => ({
    auth:
      (handler: (request: NextRequest & { auth: unknown }) => Response) =>
      async (request: NextRequest & { auth: unknown }) => {
        request.auth = mocks.session
        const response = handler(request)
        response.headers.append('set-cookie', 'authjs.session-token=refreshed; Path=/')
        return response
      },
  }),
}))
vi.mock('@blog/core/ratelimit', () => ({
  get loginRatelimit() {
    return mocks.ratelimit.current
  },
}))

const request = (path: string, init?: ConstructorParameters<typeof NextRequest>[1]) =>
  new NextRequest(`https://whemotion.com${path}`, init)

describe('admin proxy helpers', () => {
  beforeEach(() => {
    mocks.session = null
    mocks.ratelimit.current = null
  })

  it('should recognise admin paths and login attempts', () => {
    expect(isAdminPath('/admin')).toBe(true)
    expect(isAdminPath('/admin/usuarios/')).toBe(true)
    expect(isAdminPath('/administracion/')).toBe(false)
    expect(isLoginAttempt(request('/api/auth/callback/credentials', { method: 'POST' }))).toBe(true)
    expect(isLoginAttempt(request('/api/auth/callback/credentials/', { method: 'POST' }))).toBe(true)
    expect(isLoginAttempt(request('/api/auth/callback/credentials/'))).toBe(false)
    expect(isLoginAttempt(request('/api/auth/session/', { method: 'POST' }))).toBe(false)
  })

  describe('limitLoginAttempts', () => {
    it('should let attempts through when no limiter is configured', async () => {
      await expect(limitLoginAttempts(request('/api/auth/callback/credentials/'))).resolves.toBeUndefined()
    })

    it('should count attempts per client ip and answer 429 past the limit', async () => {
      const limit = vi.fn().mockResolvedValueOnce({ success: true }).mockResolvedValueOnce({ success: false })
      mocks.ratelimit.current = { limit }
      const attempt = () =>
        limitLoginAttempts(
          request('/api/auth/callback/credentials/', {
            headers: new Headers([['x-forwarded-for', '1.2.3.4, 10.0.0.1']]),
          }),
        )

      await expect(attempt()).resolves.toBeUndefined()
      const blocked = await attempt()

      expect(blocked?.status).toBe(429)
      expect(blocked?.headers.get('Retry-After')).toBe('60')
      expect(limit).toHaveBeenCalledWith('1.2.3.4')
    })

    it('should still limit requests that carry no client ip', async () => {
      const limit = vi.fn().mockResolvedValue({ success: true })
      mocks.ratelimit.current = { limit }

      await limitLoginAttempts(request('/api/auth/callback/credentials/'))

      expect(limit).toHaveBeenCalledWith('unknown')
    })
  })

  describe('withoutSessionRefresh', () => {
    it('should drop only the session cookie and keep the response otherwise intact', async () => {
      const response = new Response('body', { status: 201, statusText: 'Created' })
      response.headers.append('set-cookie', 'authjs.session-token=x; Path=/')
      response.headers.append('set-cookie', '__Secure-authjs.session-token.0=y; Path=/')
      response.headers.append('set-cookie', 'other=1; Path=/')
      response.headers.set('x-kept', 'yes')

      const cleaned = withoutSessionRefresh(response)

      expect(cleaned.headers.getSetCookie()).toEqual(['other=1; Path=/'])
      expect(cleaned.headers.get('x-kept')).toBe('yes')
      expect(cleaned.status).toBe(201)
      await expect(cleaned.text()).resolves.toBe('body')
    })

    it('should return the same response when there is no session cookie', () => {
      const response = new Response('body')

      expect(withoutSessionRefresh(response)).toBe(response)
    })
  })

  describe('guardAdmin', () => {
    it('should send visitors without a session to the login page', async () => {
      const response = await guardAdmin(request('/admin/categorias/'))

      expect(response.headers.get('location')).toBe('https://whemotion.com/admin/login/')
      expect(response.headers.getSetCookie()).toEqual([])
    })

    it('should let the login and password recovery pages open without a session', async () => {
      for (const path of [
        '/admin/login/',
        '/admin/login',
        '/admin/recuperar-contrasena/',
        '/admin/nueva-contrasena/',
      ]) {
        const response = await guardAdmin(request(path))
        expect(response.headers.get('x-middleware-next')).toBe('1')
      }
    })

    it('should let a session through, without extending it', async () => {
      mocks.session = { user: { name: 'José' } }

      const response = await guardAdmin(request('/admin/usuarios/'))

      expect(response.headers.get('x-middleware-next')).toBe('1')
      expect(response.headers.getSetCookie()).toEqual([])
    })

    it('should send a signed-in user away from the login page, to the panel', async () => {
      mocks.session = { user: { name: 'José' } }

      const response = await guardAdmin(request('/admin/login/'))

      expect(response.headers.get('location')).toBe('https://whemotion.com/admin/')
    })
  })
})

export { NextResponse }
