import { type MockedFunction, beforeEach, describe, expect, it, vi } from 'vitest'

import { getCategories } from '@blog/data'

import { GET, dynamic, revalidate } from './route'

vi.mock('@blog/data', () => ({ getCategories: vi.fn() }))

const mockedGetCategories = getCategories as MockedFunction<typeof getCategories>

const category = (localizedName: string, translations?: Record<AppLocales, string>) =>
  ({ code: 'TRAVEL', localizedName, translations, updatedAt: '2026-10-01T08:00:00.000Z' }) as Category

describe('GET /sitemap/category.xml', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedGetCategories.mockImplementation(async ({ locale }) =>
      locale === 'es'
        ? [category('Viajes', { es: 'Viajes', en: 'Travel' }), category('Música', {} as Record<AppLocales, string>)]
        : [category('Travel', { es: 'Viajes', en: 'Travel' }), category('Music')],
    )
  })

  it('should be static and revalidate once a day as a backstop', () => {
    expect(dynamic).toBe('force-static')
    expect(revalidate).toBe(86400)
  })

  it('should list the categories of every locale with their alternates', async () => {
    const response = await GET()

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('text/xml')
    expect(mockedGetCategories).toHaveBeenCalledWith({ locale: 'es' })
    expect(mockedGetCategories).toHaveBeenCalledWith({ locale: 'en' })
    expect(await response.text()).toMatchSnapshot()
  })
})
