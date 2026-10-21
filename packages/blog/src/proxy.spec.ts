import { createProxy } from 'next-i18next/proxy'
import { NextRequest, NextResponse } from 'next/server'
import { type MockedFunction, describe, expect, it, vi } from 'vitest'

import { i18nConfig } from '@blog/core/i18n/config'

import proxy, { config } from './proxy'

const i18nProxy = vi.hoisted(() => vi.fn())

vi.mock('next-i18next/proxy', () => ({ createProxy: vi.fn(() => i18nProxy) }))

const mockedCreateProxy = createProxy as MockedFunction<typeof createProxy>

const request = (path: string) => new NextRequest(`https://whemotion.com${path}`)

describe('proxy', () => {
  // Captured at collection time: the call happens on module load, before any test runs.
  const createProxyCalls = [...mockedCreateProxy.mock.calls]

  it('should build the i18n proxy from the shared config', () => {
    expect(createProxyCalls).toEqual([[i18nConfig]])
  })

  it('should hand serveable paths to the i18n proxy', () => {
    const response = NextResponse.next()
    i18nProxy.mockReturnValueOnce(response)
    const req = request('/archive/')

    expect(proxy(req)).toBe(response)
    expect(i18nProxy).toHaveBeenCalledWith(req)
  })

  it('should answer impossible paths with a 404 without reaching the app', () => {
    i18nProxy.mockClear()

    const response = proxy(request('/wp-admin/'))

    expect(response.status).toBe(404)
    expect(i18nProxy).not.toHaveBeenCalled()
  })

  it('should skip next internals, api routes, sitemaps and public files', () => {
    expect(config.matcher).toEqual(['/((?!api|_next|static|locales|images|favicon|sitemap\\.xml|sitemap/).*)'])

    const matcher = new RegExp(`^${config.matcher[0]}$`)
    expect(matcher.test('/archive/')).toBe(true)
    expect(matcher.test('/sitemap_index.xml/post/1/junk/')).toBe(true)
    expect(matcher.test('/api/revalidate')).toBe(false)
    expect(matcher.test('/_next/static/chunk.js')).toBe(false)
    expect(matcher.test('/locales/es/common.json')).toBe(false)
    expect(matcher.test('/sitemap.xml')).toBe(false)
  })
})
