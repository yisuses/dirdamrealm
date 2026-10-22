import { beforeEach, describe, expect, it, vi } from 'vitest'

import { auth } from '@blog/core/auth/config'
import { revalidatePublicContent } from '@blog/core/cache/revalidatePublicContent'
import {
  createWriter,
  deleteWriter,
  findWriterConflict,
  getWriterForAdmin,
  updateWriter,
} from '@blog/db/queries/admin/writers'

import { DELETE, PUT } from './[id]/route'
import { POST } from './route'

vi.mock('@blog/core/auth/config', () => ({ auth: vi.fn() }))
vi.mock('@blog/core/cache/revalidatePublicContent', () => ({ revalidatePublicContent: vi.fn() }))
vi.mock('@blog/db/queries/admin/writers', () => ({
  createWriter: vi.fn(async () => 'new-id'),
  updateWriter: vi.fn(async () => true),
  deleteWriter: vi.fn(async () => true),
  getWriterForAdmin: vi.fn(),
  findWriterConflict: vi.fn(async () => null),
}))

const id = '5efd132e-40a2-4f98-bc16-cc1fa8aa118e'
const body = { name: 'José', twitter: '', personalUrl: '', userId: '' }
const context = (value = id) => ({ params: Promise.resolve({ id: value }) })
const request = (method: string, data?: unknown, query = '') =>
  new Request(`https://whemotion.com/api/admin/writers/${id}/${query}`, {
    method,
    body: data === undefined ? undefined : JSON.stringify(data),
  })

describe('admin writers API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(auth).mockResolvedValue({ user: { id: 'u1' }, expires: '' } as never)
  })

  it('should refuse every operation without a session', async () => {
    vi.mocked(auth).mockResolvedValue(null as never)

    expect((await POST(request('POST', body))).status).toBe(401)
    expect((await PUT(request('PUT', body), context())).status).toBe(401)
    expect((await DELETE(request('DELETE'), context())).status).toBe(401)
  })

  it('should create and update writers, refreshing the site', async () => {
    expect((await POST(request('POST', body))).status).toBe(201)
    expect(createWriter).toHaveBeenCalledWith(body)
    expect((await PUT(request('PUT', body), context())).status).toBe(200)
    expect(updateWriter).toHaveBeenCalledWith(id, body)
    expect(revalidatePublicContent).toHaveBeenCalledTimes(2)
  })

  it('should answer conflicts with their reason', async () => {
    vi.mocked(findWriterConflict)
      .mockResolvedValueOnce('Ya hay un autor con ese nombre')
      .mockResolvedValueOnce('Ya hay un autor con ese nombre')

    const created = await POST(request('POST', body))
    const updated = await PUT(request('PUT', body), context())

    expect(created.status).toBe(409)
    await expect(updated.json()).resolves.toEqual({ error: 'Ya hay un autor con ese nombre' })
    expect(findWriterConflict).toHaveBeenLastCalledWith(body, id)
    expect(createWriter).not.toHaveBeenCalled()
  })

  it('should reject invalid bodies and answer 404 for unknown or malformed ids', async () => {
    expect((await POST(request('POST', { ...body, name: '' }))).status).toBe(400)
    expect((await PUT(request('PUT', body), context('nope'))).status).toBe(404)
    vi.mocked(updateWriter).mockResolvedValueOnce(false)
    expect((await PUT(request('PUT', body), context())).status).toBe(404)
    expect((await DELETE(request('DELETE'), context('nope'))).status).toBe(404)
    expect((await DELETE(request('DELETE'), context())).status).toBe(404)
  })

  it('should only delete a writer who signs posts once confirmed', async () => {
    vi.mocked(getWriterForAdmin).mockResolvedValue({ id, posts: 117 } as never)

    expect((await DELETE(request('DELETE'), context())).status).toBe(409)
    expect(deleteWriter).not.toHaveBeenCalled()
    expect((await DELETE(request('DELETE', undefined, '?confirm=true'), context())).status).toBe(204)
    expect(deleteWriter).toHaveBeenCalledWith(id)

    vi.mocked(getWriterForAdmin).mockResolvedValue({ id, posts: 0 } as never)
    expect((await DELETE(request('DELETE'), context())).status).toBe(204)
  })
})
