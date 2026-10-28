import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { revalidatePublicContent } from '@blog/core/cache/revalidatePublicContent'
import { publishScheduled } from '@blog/db/queries/admin/posts'

import { GET } from './route'

vi.mock('@blog/core/cache/revalidatePublicContent', () => ({ revalidatePublicContent: vi.fn() }))
vi.mock('@blog/db/queries/admin/posts', () => ({ publishScheduled: vi.fn(async () => [101, 102]) }))

const cron = (authorization?: string) =>
  new Request('https://whemotion.com/api/cron/publish-scheduled', {
    headers: authorization ? new Headers([['authorization', authorization]]) : undefined,
  })

describe('publish-scheduled cron', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('CRON_SECRET', 'secreto')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('should publish what is due and refresh the site', async () => {
    const response = await GET(cron('Bearer secreto'))

    await expect(response.json()).resolves.toEqual({ published: [101, 102] })
    expect(revalidatePublicContent).toHaveBeenCalled()
  })

  it('should not refresh the site when nothing was due', async () => {
    vi.mocked(publishScheduled).mockResolvedValueOnce([])

    await expect((await GET(cron('Bearer secreto'))).json()).resolves.toEqual({ published: [] })
    expect(revalidatePublicContent).not.toHaveBeenCalled()
  })

  it('should refuse anyone without the secret, and everyone when it is not set', async () => {
    expect((await GET(cron())).status).toBe(401)
    expect((await GET(cron('Bearer otro'))).status).toBe(401)
    vi.stubEnv('CRON_SECRET', '')
    expect((await GET(cron('Bearer '))).status).toBe(401)
    expect(publishScheduled).not.toHaveBeenCalled()
  })
})
