import nextAuth from 'next-auth'
import { type NextRequest, NextResponse } from 'next/server'

import { loginRatelimit } from '@blog/core/ratelimit'

import { baseAuthConfig, loginPath } from './base'

const { auth } = nextAuth(baseAuthConfig)

// Pages that must open without a session.
const publicAdminPaths = [loginPath, '/admin/recuperar-contrasena/', '/admin/nueva-contrasena/']

export function isAdminPath(pathname: string) {
  return pathname === '/admin' || pathname.startsWith('/admin/')
}

export function isLoginAttempt(request: NextRequest) {
  return request.method === 'POST' && /^\/api\/auth\/callback\/credentials\/?$/.test(request.nextUrl.pathname)
}

/** At most 5 login attempts per minute per IP, against password guessing. */
export async function limitLoginAttempts(request: NextRequest) {
  if (!loginRatelimit) {
    return undefined
  }
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const { success } = await loginRatelimit.limit(ip)
  return success
    ? undefined
    : Response.json({ error: 'Too many requests' }, { status: 429, headers: new Headers([['retry-after', '60']]) })
}

const sessionCookie = /^(__Secure-)?authjs\.session-token(\.\d+)?=/

/**
 * Auth.js re-issues the session cookie on every request it handles, sliding its expiry, so a
 * response landing after logout could put the session back (portfolio-blog hit this). The proxy
 * only reads the session: it ends 8 hours after login, and only sign-in and sign-out write it.
 */
export function withoutSessionRefresh(response: Response): Response {
  const cookies = response.headers.getSetCookie()
  const kept = cookies.filter(cookie => !sessionCookie.test(cookie))
  if (kept.length === cookies.length) {
    return response
  }
  const headers = new Headers(response.headers)
  headers.delete('set-cookie')
  kept.forEach(cookie => headers.append('set-cookie', cookie))
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers })
}

const guard = auth(request => {
  const { pathname } = request.nextUrl
  const isPublic = publicAdminPaths.some(path => pathname === path || pathname === path.slice(0, -1))
  if (!request.auth && !isPublic) {
    return NextResponse.redirect(new URL(loginPath, request.url))
  }
  if (request.auth && pathname.startsWith(loginPath.slice(0, -1))) {
    return NextResponse.redirect(new URL('/admin/', request.url))
  }
  return NextResponse.next()
})

/** First layer of the admin's protection: no session, no admin page. */
export async function guardAdmin(request: NextRequest) {
  const response = await guard(request, { params: Promise.resolve({}) })
  return withoutSessionRefresh(response as Response)
}
