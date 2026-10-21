import axios from 'axios'
import { type Mocked, afterEach, describe, expect, it, vi } from 'vitest'

import { commentMapper } from '@blog/api/mapper'

import { getComments } from './getComments'

vi.mock('axios')
const mockedAxios = axios as Mocked<typeof axios>

const comment = { id: 1, author: 'Ana', text: 'Hola', createdAt: '2026-10-20T10:00:00.000Z' } as unknown as Parameters<
  typeof commentMapper
>[0]

describe('getComments', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should map the comments of the given posts', async () => {
    mockedAxios.get.mockResolvedValue({ data: { data: [comment] } })

    await expect(getComments({ ids: [1, 2] })).resolves.toEqual([commentMapper(comment)])
    const url = decodeURIComponent(mockedAxios.get.mock.calls[0]![0] as string)
    expect(url).toContain('filters[post][id][$in][0]=1')
    expect(url).toContain('filters[post][id][$in][1]=2')
  })

  it('should throw when the request fails', async () => {
    mockedAxios.get.mockRejectedValue(new Error('network'))

    await expect(getComments({ ids: [1] })).rejects.toThrow('Error retrieving comments.')
  })
})
