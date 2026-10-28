import { redirect } from 'next/navigation'
import { describe, expect, it, vi } from 'vitest'

import { auth } from './config'
import { requireAdminSession } from './session'

vi.mock('./config', () => ({ loginPath: '/admin/login/', auth: vi.fn() }))
vi.mock('next/navigation', () => ({
  redirect: vi.fn(() => {
    throw new Error('NEXT_REDIRECT')
  }),
}))

describe('requireAdminSession', () => {
  it('should return the session when there is one', async () => {
    const session = { user: { name: 'José' }, expires: '' }
    vi.mocked(auth).mockResolvedValue(session as never)

    await expect(requireAdminSession()).resolves.toBe(session)
  })

  it('should redirect to the login page otherwise', async () => {
    vi.mocked(auth).mockResolvedValue(null as never)

    await expect(requireAdminSession()).rejects.toThrow('NEXT_REDIRECT')
    expect(redirect).toHaveBeenCalledWith('/admin/login/')
  })
})
