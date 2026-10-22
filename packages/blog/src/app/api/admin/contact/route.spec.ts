import { beforeEach, describe, expect, it, vi } from 'vitest'

import { auth } from '@blog/core/auth/config'
import { revalidatePublicContent } from '@blog/core/cache/revalidatePublicContent'
import { saveContact } from '@blog/db/queries/admin/contact'

import { PUT } from './route'

vi.mock('@blog/core/auth/config', () => ({ auth: vi.fn() }))
vi.mock('@blog/core/cache/revalidatePublicContent', () => ({ revalidatePublicContent: vi.fn() }))
vi.mock('@blog/db/queries/admin/contact', () => ({ saveContact: vi.fn() }))

const body = { display: true, name: 'Whe', email: '', socialLinks: [] }
const request = (data: unknown) =>
  new Request('https://whemotion.com/api/admin/contact/', { method: 'PUT', body: JSON.stringify(data) })

describe('admin contact API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should save the contact block and refresh the site', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'u1' }, expires: '' } as never)

    expect((await PUT(request(body))).status).toBe(204)
    expect(saveContact).toHaveBeenCalledWith(body)
    expect(revalidatePublicContent).toHaveBeenCalled()
  })

  it('should refuse without a session and reject invalid data', async () => {
    vi.mocked(auth).mockResolvedValue(null as never)
    expect((await PUT(request(body))).status).toBe(401)

    vi.mocked(auth).mockResolvedValue({ user: { id: 'u1' }, expires: '' } as never)
    expect((await PUT(request({ ...body, email: 'x' }))).status).toBe(400)
    expect(saveContact).not.toHaveBeenCalled()
  })
})
