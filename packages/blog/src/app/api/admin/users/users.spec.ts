import { beforeEach, describe, expect, it, vi } from 'vitest'

import { auth } from '@blog/core/auth/config'
import { createUser, isEmailTaken, updateUser } from '@blog/db/queries/admin/users'

import { PUT } from './[id]/route'
import { POST } from './route'

vi.mock('@blog/core/auth/config', () => ({ auth: vi.fn() }))
vi.mock('@blog/core/auth/passwords', () => ({ hashPassword: vi.fn(async (password: string) => `hash(${password})`) }))
vi.mock('@blog/db/queries/admin/users', () => ({
  createUser: vi.fn(async () => 'new-id'),
  updateUser: vi.fn(async () => true),
  isEmailTaken: vi.fn(async () => false),
}))

const me = '11111111-1111-4111-8111-111111111111'
const other = '22222222-2222-4222-8222-222222222222'
const create = { name: 'Ana', email: 'ana@example.com', password: 'clave-larga-1', passwordConfirm: 'clave-larga-1' }
const edit = { name: 'Ana', email: 'ana@example.com', active: true, password: '', passwordConfirm: '' }
const request = (method: string, data: unknown) =>
  new Request('https://whemotion.com/api/admin/users/', { method, body: JSON.stringify(data) })
const context = (id: string) => ({ params: Promise.resolve({ id }) })

describe('admin users API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(auth).mockResolvedValue({ user: { id: me }, expires: '' } as never)
  })

  it('should refuse without a session', async () => {
    vi.mocked(auth).mockResolvedValue(null as never)

    expect((await POST(request('POST', create))).status).toBe(401)
    expect((await PUT(request('PUT', edit), context(other))).status).toBe(401)
  })

  it('should create a user with a hashed password', async () => {
    const response = await POST(request('POST', create))

    expect(response.status).toBe(201)
    expect(createUser).toHaveBeenCalledWith({
      name: 'Ana',
      email: 'ana@example.com',
      passwordHash: 'hash(clave-larga-1)',
    })
  })

  it('should reject a taken email or an invalid body', async () => {
    vi.mocked(isEmailTaken).mockResolvedValueOnce(true)
    expect((await POST(request('POST', create))).status).toBe(409)
    expect((await POST(request('POST', { ...create, passwordConfirm: 'x' }))).status).toBe(400)

    vi.mocked(isEmailTaken).mockResolvedValueOnce(true)
    expect((await PUT(request('PUT', edit), context(other))).status).toBe(409)
    expect(isEmailTaken).toHaveBeenLastCalledWith('ana@example.com', other)
    expect(createUser).not.toHaveBeenCalled()
  })

  it('should update a user, hashing the password only when a new one is given', async () => {
    expect((await PUT(request('PUT', edit), context(other))).status).toBe(200)
    expect(updateUser).toHaveBeenLastCalledWith(other, { name: 'Ana', email: 'ana@example.com', active: true })

    await PUT(
      request('PUT', { ...edit, active: false, password: 'clave-larga-2', passwordConfirm: 'clave-larga-2' }),
      context(other),
    )
    expect(updateUser).toHaveBeenLastCalledWith(other, {
      name: 'Ana',
      email: 'ana@example.com',
      active: false,
      passwordHash: 'hash(clave-larga-2)',
    })
  })

  it('should not let anyone deactivate themselves', async () => {
    const response = await PUT(request('PUT', { ...edit, active: false }), context(me))

    expect(response.status).toBe(409)
    expect(updateUser).not.toHaveBeenCalled()
    expect((await PUT(request('PUT', edit), context(me))).status).toBe(200)
  })

  it('should answer 404 for malformed or unknown users', async () => {
    expect((await PUT(request('PUT', edit), context('nope'))).status).toBe(404)
    vi.mocked(updateUser).mockResolvedValueOnce(false)
    expect((await PUT(request('PUT', edit), context(other))).status).toBe(404)
  })
})
