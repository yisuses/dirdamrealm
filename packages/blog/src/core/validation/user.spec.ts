import { describe, expect, it } from 'vitest'

import { passwordResetRequestSchema, passwordResetSchema, userCreateSchema, userUpdateSchema } from './user'

const paths = (result: { error?: { issues: { path: PropertyKey[] }[] } }) =>
  result.error?.issues.map(issue => issue.path.join('.'))

describe('user schemas', () => {
  it('should create users with a long enough, confirmed password and a normalised email', () => {
    const result = userCreateSchema.parse({
      name: ' Ana ',
      email: ' ANA@Example.com ',
      password: 'clave-larga-1',
      passwordConfirm: 'clave-larga-1',
    })

    expect(result).toEqual({
      name: 'Ana',
      email: 'ana@example.com',
      password: 'clave-larga-1',
      passwordConfirm: 'clave-larga-1',
    })
    expect(
      paths(userCreateSchema.safeParse({ name: '', email: 'x', password: 'corta', passwordConfirm: 'otra' })),
    ).toEqual(['name', 'email', 'password', 'passwordConfirm'])
    expect(
      paths(
        userCreateSchema.safeParse({ name: 'A', email: 'a@b.co', password: 'clave-larga-1', passwordConfirm: 'otra' }),
      ),
    ).toEqual(['passwordConfirm'])
  })

  it('should let an edit keep the current password by leaving it empty', () => {
    const base = { name: 'Ana', email: 'ana@example.com', active: true }

    expect(userUpdateSchema.safeParse({ ...base, password: '', passwordConfirm: '' }).success).toBe(true)
    expect(paths(userUpdateSchema.safeParse({ ...base, password: 'corta', passwordConfirm: 'corta' }))).toEqual([
      'password',
    ])
    expect(
      paths(userUpdateSchema.safeParse({ ...base, password: 'x'.repeat(201), passwordConfirm: 'x'.repeat(201) })),
    ).toEqual(['password'])
  })

  it('should validate reset requests and resets', () => {
    expect(passwordResetRequestSchema.safeParse({ email: 'nope' }).success).toBe(false)
    expect(
      passwordResetSchema.safeParse({ token: 't', password: 'clave-larga-1', passwordConfirm: 'clave-larga-1' })
        .success,
    ).toBe(true)
    expect(
      paths(passwordResetSchema.safeParse({ token: '', password: 'clave-larga-1', passwordConfirm: 'x' })),
    ).toEqual(['token', 'passwordConfirm'])
  })
})
