import { beforeEach, describe, expect, it, vi } from 'vitest'

import { auth } from '@blog/core/auth/config'
import { fetchLinkPreview } from '@blog/core/linkPreview/linkPreview'

import { GET } from './route'

vi.mock('@blog/core/auth/config', () => ({ auth: vi.fn() }))
vi.mock('@blog/core/linkPreview/linkPreview', () => ({ fetchLinkPreview: vi.fn() }))

const request = (url?: string) =>
  new Request(`https://whemotion.com/api/admin/link-preview/${url ? `?url=${encodeURIComponent(url)}` : ''}`)

describe('link preview API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(auth).mockResolvedValue({ user: { id: 'me' }, expires: '' } as never)
  })

  it('should answer in the shape the link tool expects', async () => {
    vi.mocked(fetchLinkPreview).mockResolvedValueOnce({ title: 'T', description: 'D', image: 'https://x/i.jpg' })

    await expect((await GET(request('https://x.com/a'))).json()).resolves.toEqual({
      success: 1,
      link: 'https://x.com/a',
      meta: { title: 'T', description: 'D', image: { url: 'https://x/i.jpg' } },
    })
    expect(fetchLinkPreview).toHaveBeenCalledWith('https://x.com/a')
  })

  it('should report pages it could not read, or failures, as unsuccessful', async () => {
    vi.mocked(fetchLinkPreview).mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error('timeout'))

    await expect((await GET(request())).json()).resolves.toEqual({ success: 0 })
    expect(fetchLinkPreview).toHaveBeenCalledWith('')
    await expect((await GET(request('https://x.com'))).json()).resolves.toEqual({ success: 0 })
  })

  it('should refuse without a session', async () => {
    vi.mocked(auth).mockResolvedValue(null as never)

    expect((await GET(request('https://x.com'))).status).toBe(401)
    expect(fetchLinkPreview).not.toHaveBeenCalled()
  })
})
