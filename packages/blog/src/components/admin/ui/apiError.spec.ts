import { AxiosError, type AxiosResponse } from 'axios'
import { describe, expect, it } from 'vitest'

import { apiErrorMessage } from './apiError'

const failed = (data: unknown) => new AxiosError('x', '400', undefined, undefined, { data } as AxiosResponse)

describe('apiErrorMessage', () => {
  it("should use the API's message when it sent one", () => {
    expect(apiErrorMessage(failed({ error: 'Ya existe' }))).toBe('Ya existe')
  })

  it('should fall back for validation details, network errors and anything else', () => {
    expect(apiErrorMessage(failed({ error: [{ path: ['code'] }] }))).toBe(
      'No se ha podido guardar. Inténtalo de nuevo.',
    )
    expect(apiErrorMessage(new AxiosError('network'))).toBe('No se ha podido guardar. Inténtalo de nuevo.')
    expect(apiErrorMessage(new Error('x'), 'Otro mensaje')).toBe('Otro mensaje')
  })
})
