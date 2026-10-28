import { beforeEach, describe, expect, it, vi } from 'vitest'

import { auth } from '@blog/core/auth/config'
import { revalidatePublicContent } from '@blog/core/cache/revalidatePublicContent'
import {
  createCategory,
  deleteCategory,
  getCategoryForAdmin,
  isCategoryCodeTaken,
  updateCategory,
} from '@blog/db/queries/admin/categories'

import { DELETE, PUT } from './[id]/route'
import { POST } from './route'

vi.mock('@blog/core/auth/config', () => ({ auth: vi.fn() }))
vi.mock('@blog/core/cache/revalidatePublicContent', () => ({ revalidatePublicContent: vi.fn() }))
vi.mock('@blog/db/queries/admin/categories', () => ({
  createCategory: vi.fn(async () => 'new-id'),
  updateCategory: vi.fn(async () => true),
  deleteCategory: vi.fn(async () => true),
  getCategoryForAdmin: vi.fn(),
  isCategoryCodeTaken: vi.fn(async () => false),
}))

const id = '5efd132e-40a2-4f98-bc16-cc1fa8aa118e'
const body = {
  code: 'VIAJES',
  main: true,
  es: { name: 'Viajes', description: '' },
  en: { name: 'Travel', description: '' },
}
const context = (value = id) => ({ params: Promise.resolve({ id: value }) })
const request = (method: string, data?: unknown, query = '') =>
  new Request(`https://whemotion.com/api/admin/categories/${id}/${query}`, {
    method,
    body: data === undefined ? undefined : JSON.stringify(data),
  })

describe('admin categories API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(auth).mockResolvedValue({ user: { id: 'u1' }, expires: '' } as never)
  })

  it('should refuse every operation without a session', async () => {
    vi.mocked(auth).mockResolvedValue(null as never)

    expect((await POST(request('POST', body))).status).toBe(401)
    expect((await PUT(request('PUT', body), context())).status).toBe(401)
    expect((await DELETE(request('DELETE'), context())).status).toBe(401)
    expect(createCategory).not.toHaveBeenCalled()
  })

  it('should create a category and refresh the site', async () => {
    const response = await POST(request('POST', body))

    expect(response.status).toBe(201)
    await expect(response.json()).resolves.toEqual({ id: 'new-id' })
    expect(createCategory).toHaveBeenCalledWith(body)
    expect(revalidatePublicContent).toHaveBeenCalled()
  })

  it('should reject invalid bodies and taken codes', async () => {
    expect((await POST(request('POST', { ...body, code: 'x' }))).status).toBe(400)

    vi.mocked(isCategoryCodeTaken).mockResolvedValueOnce(true)
    const conflict = await POST(request('POST', body))
    expect(conflict.status).toBe(409)
    expect(createCategory).not.toHaveBeenCalled()

    vi.mocked(isCategoryCodeTaken).mockResolvedValueOnce(true)
    expect((await PUT(request('PUT', body), context())).status).toBe(409)
    expect(isCategoryCodeTaken).toHaveBeenLastCalledWith('VIAJES', id)
  })

  it('should update a category and refresh the site', async () => {
    const response = await PUT(request('PUT', body), context())

    expect(response.status).toBe(200)
    expect(updateCategory).toHaveBeenCalledWith(id, body)
    expect(revalidatePublicContent).toHaveBeenCalled()
  })

  it('should answer 404 for unknown or malformed ids', async () => {
    vi.mocked(updateCategory).mockResolvedValueOnce(false)
    expect((await PUT(request('PUT', body), context())).status).toBe(404)
    expect((await PUT(request('PUT', body), context('nope'))).status).toBe(404)
    expect((await DELETE(request('DELETE'), context('nope'))).status).toBe(404)
    expect((await DELETE(request('DELETE'), context())).status).toBe(404)
    expect(revalidatePublicContent).not.toHaveBeenCalled()
  })

  it('should only delete a category still on posts once confirmed', async () => {
    vi.mocked(getCategoryForAdmin).mockResolvedValue({ id, posts: 3 } as never)

    const unconfirmed = await DELETE(request('DELETE'), context())
    expect(unconfirmed.status).toBe(409)
    await expect(unconfirmed.json()).resolves.toMatchObject({ posts: 3 })
    expect(deleteCategory).not.toHaveBeenCalled()

    const confirmed = await DELETE(request('DELETE', undefined, '?confirm=true'), context())
    expect(confirmed.status).toBe(204)
    expect(deleteCategory).toHaveBeenCalledWith(id)
    expect(revalidatePublicContent).toHaveBeenCalled()
  })

  it('should delete an unused category without confirmation', async () => {
    vi.mocked(getCategoryForAdmin).mockResolvedValue({ id, posts: 0 } as never)

    expect((await DELETE(request('DELETE'), context())).status).toBe(204)
  })
})
