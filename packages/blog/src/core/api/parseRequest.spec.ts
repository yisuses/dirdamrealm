import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

import { auth } from '@blog/core/auth/config'

import { parseAuthRequest, requireAuth } from './parseRequest'

vi.mock('@blog/core/auth/config', () => ({ auth: vi.fn() }))

const session = { user: { id: 'u1', name: 'José' }, expires: '' }
const schema = z.object({ name: z.string().min(1) })
const request = (body: string) => new Request('https://whemotion.com/api/admin/x/', { method: 'POST', body })

describe('requireAuth', () => {
  it('should answer 401 without a session', async () => {
    vi.mocked(auth).mockResolvedValue(null as never)

    const result = await requireAuth()

    expect(result.ok).toBe(false)
    expect(!result.ok && result.response.status).toBe(401)
  })
})

describe('parseAuthRequest', () => {
  it('should return the session and the validated body', async () => {
    vi.mocked(auth).mockResolvedValue(session as never)

    await expect(parseAuthRequest(request('{"name":"Viajes"}'), schema)).resolves.toEqual({
      ok: true,
      session,
      data: { name: 'Viajes' },
    })
  })

  it('should not read the body without a session', async () => {
    vi.mocked(auth).mockResolvedValue(null as never)

    const result = await parseAuthRequest(request('{"name":"Viajes"}'), schema)

    expect(!result.ok && result.response.status).toBe(401)
  })

  it('should answer 400 to invalid JSON and to bodies that do not match the schema', async () => {
    vi.mocked(auth).mockResolvedValue(session as never)

    const invalidJson = await parseAuthRequest(request('{'), schema)
    const invalidBody = await parseAuthRequest(request('{"name":""}'), schema)

    expect(!invalidJson.ok && invalidJson.response.status).toBe(400)
    expect(!invalidBody.ok && invalidBody.response.status).toBe(400)
    await expect(!invalidBody.ok && invalidBody.response.json()).resolves.toMatchObject({
      error: [expect.objectContaining({ path: ['name'] })],
    })
  })
})
