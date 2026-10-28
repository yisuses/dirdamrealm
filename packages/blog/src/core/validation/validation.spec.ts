import { describe, expect, it } from 'vitest'

import { categorySchema } from './category'
import { isUuid } from './uuid'

const valid = {
  code: 'VIAJES',
  main: false,
  es: { name: 'Viajes', description: '' },
  en: { name: 'Travel', description: '' },
}

describe('categorySchema', () => {
  it('should accept a valid category, trimming its texts', () => {
    expect(categorySchema.parse({ ...valid, es: { name: '  Viajes ', description: ' x ' } }).es).toEqual({
      name: 'Viajes',
      description: 'x',
    })
  })

  it('should explain every invalid field in Spanish', () => {
    const result = categorySchema.safeParse({
      ...valid,
      code: 'Viajes 2',
      es: { name: ' ', description: 'x'.repeat(501) },
      en: { name: 'x'.repeat(61), description: '' },
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues.map(issue => [issue.path.join('.'), issue.message])).toEqual([
      ['code', 'Solo letras mayúsculas sin tildes, de 1 a 16 (por ejemplo, VIAJES)'],
      ['es.name', 'Escribe el nombre'],
      ['es.description', 'Máximo 500 caracteres'],
      ['en.name', 'Máximo 60 caracteres'],
    ])
  })
})

describe('isUuid', () => {
  it('should accept uuids only', () => {
    expect(isUuid('5efd132e-40a2-4f98-bc16-cc1fa8aa118e')).toBe(true)
    expect(isUuid('nope')).toBe(false)
    expect(isUuid('5efd132e40a24f98bc16cc1fa8aa118e')).toBe(false)
  })
})
