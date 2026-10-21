import axios from 'axios'
import { type Mocked, afterEach, describe, expect, it, vi } from 'vitest'

import { aboutMapper } from '@blog/api/mapper'

import { getAbout } from './getAbout'

vi.mock('axios')
const mockedAxios = axios as Mocked<typeof axios>

const aboutResponse = { id: 1, content: 'About us' } as unknown as Parameters<typeof aboutMapper>[0]

describe('getAbout', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should map the about entry', async () => {
    mockedAxios.get.mockResolvedValue({ data: { data: aboutResponse } })

    await expect(getAbout()).resolves.toEqual(aboutMapper(aboutResponse))
    expect(mockedAxios.get).toHaveBeenCalledWith('https://api.com/api/about')
  })

  it('should return undefined when there is no about entry', async () => {
    mockedAxios.get.mockResolvedValue({ data: { data: null } })

    await expect(getAbout()).resolves.toBeUndefined()
  })

  it('should throw when the request fails', async () => {
    mockedAxios.get.mockRejectedValue(new Error('network'))

    await expect(getAbout()).rejects.toThrow('Error retrieving about info.')
  })
})
