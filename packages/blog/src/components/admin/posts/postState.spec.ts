import { describe, expect, it } from 'vitest'

import { formatDay, previewPath, publicPostPath, stateLabel } from './postState'

describe('postState', () => {
  it('should describe each state of a language in words and color', () => {
    const base = { scheduledFor: null, hasUnpublishedChanges: false }

    expect(stateLabel({ ...base, status: 'published' })).toEqual({ label: 'Publicada', palette: 'green' })
    expect(stateLabel({ ...base, status: 'published', hasUnpublishedChanges: true })).toEqual({
      label: 'Publicada, con cambios sin publicar',
      palette: 'orange',
    })
    expect(stateLabel({ ...base, status: 'draft', scheduledFor: '2026-11-12' })).toEqual({
      label: 'Programada para el 12 de noviembre de 2026',
      palette: 'blue',
    })
    expect(stateLabel({ ...base, status: 'archived' })).toEqual({ label: 'Borrador', palette: 'gray' })
  })

  it('should format days in Spanish and build the public and preview paths per language', () => {
    expect(formatDay('2026-01-01')).toBe('1 de enero de 2026')
    expect(publicPostPath('es', 12)).toBe('/post/12/')
    expect(publicPostPath('en', 13)).toBe('/en/post/13/')
    expect(previewPath('es', 12, 'tok')).toBe('/vista-previa/12/tok/')
    expect(previewPath('en', 13, 'tok')).toBe('/en/vista-previa/13/tok/')
  })
})
