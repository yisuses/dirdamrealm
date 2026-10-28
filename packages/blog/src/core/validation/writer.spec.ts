import { describe, expect, it } from 'vitest'

import { writerSchema } from './writer'

const valid = { name: 'José Madrid', twitter: '@jose', personalUrl: '', userId: '' }

describe('writerSchema', () => {
  it('should accept a card with optional links and user', () => {
    expect(writerSchema.safeParse(valid).success).toBe(true)
    expect(
      writerSchema.safeParse({
        ...valid,
        personalUrl: 'https://jose.es',
        userId: '5efd132e-40a2-4f98-bc16-cc1fa8aa118e',
      }).success,
    ).toBe(true)
  })

  it('should explain every invalid field', () => {
    const result = writerSchema.safeParse({
      name: ' ',
      twitter: 'x'.repeat(61),
      personalUrl: 'jose.es',
      userId: 'nope',
    })

    expect(result.error?.issues.map(issue => issue.path.join('.'))).toEqual([
      'name',
      'twitter',
      'personalUrl',
      'userId',
    ])
    expect(result.error?.issues[0]!.message).toBe('Escribe el nombre')
  })
})
