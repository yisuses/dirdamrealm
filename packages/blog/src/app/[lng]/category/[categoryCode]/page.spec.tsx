import * as sentry from '@sentry/nextjs'
import { type MockedFunction, beforeEach, describe, expect, it, vi } from 'vitest'

import { getCategories } from '@blog/data'

import Page from './page'

vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }))
vi.mock('@blog/data', () => ({ getCategories: vi.fn() }))

const mockedGetCategories = getCategories as MockedFunction<typeof getCategories>

const category = { id: 1, code: 'TRAVEL', localizedName: 'Viajes y más' } as Category

const params = (lng: AppLocales, categoryCode: string) => ({ params: Promise.resolve({ lng, categoryCode }) })

const notFound = { digest: expect.stringMatching(/^NEXT_HTTP_ERROR_FALLBACK;404/) }
const redirectTo = (url: string) => ({ digest: expect.stringContaining(`NEXT_REDIRECT;replace;${url};`) })

describe('Category code page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedGetCategories.mockResolvedValue([category])
  })

  it('should 404 on a malformed category code', async () => {
    await expect(Page(params('es', 'travel'))).rejects.toMatchObject(notFound)
    expect(mockedGetCategories).not.toHaveBeenCalled()
  })

  it('should report a failed fetch and 404', async () => {
    const error = new Error('Strapi down')
    mockedGetCategories.mockRejectedValue(error)

    await expect(Page(params('es', 'TRAVEL'))).rejects.toMatchObject(notFound)
    expect(sentry.captureException).toHaveBeenCalledWith(error)
  })

  it('should report and 404 when the code does not match exactly one category', async () => {
    mockedGetCategories.mockResolvedValue([category, category])

    await expect(Page(params('es', 'TRAVEL'))).rejects.toMatchObject(notFound)
    expect(sentry.captureException).toHaveBeenCalledWith("Category with code 'TRAVEL' not found, or found multiple")
  })

  it('should redirect to the canonical url of the default locale', async () => {
    await expect(Page(params('es', 'TRAVEL'))).rejects.toMatchObject(redirectTo('/category/TRAVEL/viajes-y-mas/'))
    expect(mockedGetCategories).toHaveBeenCalledWith({ locale: 'es', code: 'TRAVEL' })
  })

  it('should redirect to the canonical url of a prefixed locale', async () => {
    await expect(Page(params('en', 'TRAVEL'))).rejects.toMatchObject(redirectTo('/en/category/TRAVEL/viajes-y-mas/'))
  })
})
