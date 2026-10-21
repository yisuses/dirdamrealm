import axios from 'axios'
import { type Mocked, afterEach, describe, expect, it, vi } from 'vitest'

import { getCategories } from './getCategories'

vi.mock('axios')
const mockedAxios = axios as Mocked<typeof axios>

const requestedUrl = () => decodeURIComponent(mockedAxios.get.mock.calls[0]![0] as string)

const category = { id: 1, code: 'ENG', name: 'Ingeniería', translations: { en: 'Engineering' } }

describe('getCategories', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should map the categories in english by default', async () => {
    mockedAxios.get.mockResolvedValue({ data: { data: [category] } })

    await expect(getCategories({})).resolves.toEqual([{ ...category, localizedName: 'Engineering' }])
    expect(requestedUrl()).not.toContain('filters')
  })

  it('should filter by code, sort and localize', async () => {
    mockedAxios.get.mockResolvedValue({ data: { data: [category] } })

    await expect(getCategories({ locale: 'es', code: 'ENG', sort: ['name:asc'] })).resolves.toEqual([
      { ...category, localizedName: 'Ingeniería' },
    ])
    expect(requestedUrl()).toContain('filters[code]=ENG')
    expect(requestedUrl()).toContain('sort[0]=name:asc')
  })

  it('should throw when the request fails', async () => {
    mockedAxios.get.mockRejectedValue(new Error('network'))

    await expect(getCategories({})).rejects.toThrow('Error retrieving categories.')
  })
})
