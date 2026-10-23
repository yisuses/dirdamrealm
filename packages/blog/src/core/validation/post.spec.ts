import { describe, expect, it } from 'vitest'

import { editorContentSchema, postActionSchema, postSaveSchema, publishableSchema, scheduleSchema } from './post'

const fields = { cover: null, coverImageAuthor: '', coverImageSourceUrl: '', writerId: '', categoryIds: [] }

describe('post validation', () => {
  it('should accept the blocks the site shows, filling in time and version', () => {
    expect(editorContentSchema.parse({ blocks: [{ type: 'paragraph', data: { text: 'Hola' } }] })).toEqual({
      time: 0,
      version: '',
      blocks: [{ type: 'paragraph', data: { text: 'Hola' } }],
    })
    expect(editorContentSchema.safeParse({ blocks: [{ type: 'checklist', data: {} }] }).success).toBe(false)
  })

  it('should refuse content over a megabyte', () => {
    const huge = { blocks: [{ type: 'paragraph', data: { text: 'x'.repeat(1024 * 1024) } }] }

    expect(editorContentSchema.safeParse(huge).error?.issues[0]?.message).toBe('El texto es demasiado largo')
  })

  it('should let drafts save without a title but not publish without title and summary', () => {
    const save = { ...fields, title: ' ', summary: '', content: { blocks: [] } }

    expect(postSaveSchema.parse(save)).toMatchObject({ title: '', summary: '' })
    expect(publishableSchema.safeParse({ title: ' ', summary: 'x' }).success).toBe(false)
    expect(publishableSchema.safeParse({ title: 'x', summary: ' ' }).success).toBe(false)
    expect(postSaveSchema.safeParse({ ...save, coverImageSourceUrl: 'ftp://x' }).success).toBe(false)
    expect(postSaveSchema.safeParse({ ...save, categoryIds: ['nope'] }).success).toBe(false)
  })

  it('should take the actions the editor sends, with a day or none to schedule', () => {
    expect(postActionSchema.parse({ action: 'publish' })).toEqual({ action: 'publish' })
    expect(postActionSchema.parse({ action: 'schedule', date: '2026-12-01' })).toEqual({
      action: 'schedule',
      date: '2026-12-01',
    })
    expect(scheduleSchema.parse({ date: null })).toEqual({ date: null })
    expect(postActionSchema.safeParse({ action: 'schedule', date: '1/12/2026' }).success).toBe(false)
    expect(postActionSchema.safeParse({ action: 'archive' }).success).toBe(false)
  })
})
