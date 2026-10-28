import bcrypt from 'bcryptjs'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getActiveUserByEmail } from '@blog/db/queries/users'

import { authorizeCredentials } from './credentials'

vi.mock('@blog/db/queries/users', () => ({ getActiveUserByEmail: vi.fn() }))

// A Strapi-style `$2a$` hash, as migrated: existing passwords must keep working.
const hash = bcrypt.hashSync('secreta', 4).replace(/^\$2b\$/, '$2a$')
const user = { id: 'u1', name: 'José', email: 'jose@example.com', passwordHash: hash }

describe('authorizeCredentials', () => {
  beforeEach(() => {
    vi.mocked(getActiveUserByEmail).mockReset()
  })

  it('should accept the right password of an active user', async () => {
    vi.mocked(getActiveUserByEmail).mockResolvedValue(user as never)

    await expect(authorizeCredentials({ email: 'jose@example.com', password: 'secreta' })).resolves.toEqual({
      id: 'u1',
      name: 'José',
      email: 'jose@example.com',
    })
  })

  it('should reject a wrong password', async () => {
    vi.mocked(getActiveUserByEmail).mockResolvedValue(user as never)

    await expect(authorizeCredentials({ email: 'jose@example.com', password: 'otra' })).resolves.toBeNull()
  })

  it('should still compare a hash when the email is unknown, so timing does not reveal accounts', async () => {
    const compare = vi.spyOn(bcrypt, 'compare')
    vi.mocked(getActiveUserByEmail).mockResolvedValue(undefined as never)

    await expect(authorizeCredentials({ email: 'nadie@example.com', password: 'x' })).resolves.toBeNull()
    expect(compare).toHaveBeenCalledWith('x', expect.stringMatching(/^\$2[ab]\$10\$/))
  })

  it('should reject missing or non-text credentials without querying', async () => {
    await expect(authorizeCredentials({ email: 'a@b.c' })).resolves.toBeNull()
    await expect(authorizeCredentials({ email: 1, password: 'x' })).resolves.toBeNull()
    await expect(authorizeCredentials({ email: 'a@b.c', password: ['x'] })).resolves.toBeNull()
    expect(getActiveUserByEmail).not.toHaveBeenCalled()
  })
})
