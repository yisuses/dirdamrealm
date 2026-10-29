import { createProxy } from 'next-i18next/proxy'
import { NextRequest, NextResponse } from 'next/server'
import { type MockedFunction, beforeEach, describe, expect, it, vi } from 'vitest'

import { guardAdmin, limitLoginAttempts } from '@blog/core/auth/proxy'
import { i18nConfig } from '@blog/core/i18n/config'

import proxy, { config } from './proxy'

const i18nProxy = vi.hoisted(() => vi.fn())

vi.mock('next-i18next/proxy', () => ({ createProxy: vi.fn(() => i18nProxy) }))
vi.mock('@blog/core/auth/proxy', async importOriginal => ({
  ...(await importOriginal<typeof import('@blog/core/auth/proxy')>()),
  guardAdmin: vi.fn(async () => new Response('admin')),
  limitLoginAttempts: vi.fn(async () => undefined),
}))

const mockedCreateProxy = createProxy as MockedFunction<typeof createProxy>

const request = (path: string, method = 'GET') => new NextRequest(`https://whemotion.com${path}`, { method })

describe('proxy', () => {
  // Captured at collection time: the call happens on module load, before any test runs.
  const createProxyCalls = [...mockedCreateProxy.mock.calls]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should build the i18n proxy from the shared config', () => {
    expect(createProxyCalls).toEqual([[i18nConfig]])
  })

  it('should hand serveable paths to the i18n proxy', async () => {
    const response = NextResponse.next()
    i18nProxy.mockReturnValueOnce(response)
    const req = request('/archive/')

    await expect(proxy(req)).resolves.toBe(response)
    expect(i18nProxy).toHaveBeenCalledWith(req)
  })

  it('should answer impossible paths with a 404 without reaching the app', async () => {
    const response = await proxy(request('/wp-admin/'))

    expect(response?.status).toBe(404)
    expect(i18nProxy).not.toHaveBeenCalled()
  })

  it('should send admin pages to the session guard, not to the i18n proxy', async () => {
    const req = request('/admin/categorias/')

    await expect((await proxy(req))?.text()).resolves.toBe('admin')
    expect(guardAdmin).toHaveBeenCalledWith(req)
    expect(i18nProxy).not.toHaveBeenCalled()
  })

  it('should rate-limit login attempts before anything else', async () => {
    const req = request('/api/auth/callback/credentials/', 'POST')

    await expect(proxy(req)).resolves.toBeUndefined()
    expect(limitLoginAttempts).toHaveBeenCalledWith(req)
    expect(i18nProxy).not.toHaveBeenCalled()
  })

  it('should skip next internals, api routes, sitemaps and public files, but match the login callback', () => {
    const [pages, login] = config.matcher
    expect(pages).toBe(
      '/((?!api|_next|static|locales|images|favicon|icon\\.svg|apple-icon\\.png|manifest\\.webmanifest|sitemap\\.xml|sitemap/).*)',
    )
    expect(login).toBe('/api/auth/callback/credentials/:path*')

    const matcher = new RegExp(`^${pages}$`)
    expect(matcher.test('/archive/')).toBe(true)
    expect(matcher.test('/admin/')).toBe(true)
    expect(matcher.test('/sitemap_index.xml/post/1/junk/')).toBe(true)
    expect(matcher.test('/api/revalidate')).toBe(false)
    expect(matcher.test('/_next/static/chunk.js')).toBe(false)
    expect(matcher.test('/locales/es/common.json')).toBe(false)
    expect(matcher.test('/sitemap.xml')).toBe(false)
    expect(matcher.test('/icon.svg')).toBe(false)
    expect(matcher.test('/manifest.webmanifest')).toBe(false)
  })
})
