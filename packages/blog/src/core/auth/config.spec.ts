import nextAuth from 'next-auth'
import { describe, expect, it, vi } from 'vitest'

import { baseAuthConfig } from './base'
import { authorizeCredentials } from './credentials'

vi.mock('next-auth', () => ({ default: vi.fn(() => ({ handlers: { GET: 'get', POST: 'post' }, auth: 'auth' })) }))
vi.mock('next-auth/providers/credentials', () => ({ default: vi.fn(options => ({ id: 'credentials', options })) }))
vi.mock('./credentials', () => ({ authorizeCredentials: vi.fn() }))

describe('auth config', () => {
  it('should add the credentials provider, checked against the users table, to the base config', async () => {
    const handlers = await import('./handlers')

    expect(handlers.GET).toBe('get')
    expect(handlers.POST).toBe('post')
    const [config] = vi.mocked(nextAuth).mock.calls[0] as unknown as [Record<string, unknown>]
    expect(config).toMatchObject({
      session: { strategy: 'jwt', maxAge: 8 * 60 * 60 },
      pages: { signIn: '/admin/login/' },
      trustHost: true,
      providers: [{ id: 'credentials', options: { authorize: authorizeCredentials } }],
    })
  })
})

describe('session callbacks', () => {
  const { jwt, session } = baseAuthConfig.callbacks

  it('should keep the user id in the token on sign-in and leave it otherwise', () => {
    expect(jwt({ token: {}, user: { id: 'u1' } } as never)).toEqual({ sub: 'u1' })
    expect(jwt({ token: { sub: 'u1' }, user: undefined } as never)).toEqual({ sub: 'u1' })
  })

  it('should expose the user id on the session', () => {
    const base = { user: { name: 'José' }, expires: '' }

    expect(session({ session: { ...base, user: { ...base.user } }, token: { sub: 'u1' } } as never)).toMatchObject({
      user: { id: 'u1', name: 'José' },
    })
    expect(session({ session: { ...base, user: { ...base.user } }, token: {} } as never)).toEqual(base)
  })
})
