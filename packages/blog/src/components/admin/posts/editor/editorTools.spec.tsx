import type { API } from '@editorjs/editorjs'
import { describe, expect, it, vi } from 'vitest'

import { ImageTool } from './ImageTool'
import { editorMessages } from './editorI18n'
import { SiteList, buildEditorTools } from './editorTools'

describe('editor tools', () => {
  it('should offer bulleted and numbered lists only, without checklists or numbering options', () => {
    expect(SiteList.toolbox.map(entry => entry.data)).toEqual([{ style: 'unordered' }, { style: 'ordered' }])

    const list = new SiteList({
      data: { style: 'ordered', meta: {}, items: [{ content: 'Uno', meta: {}, items: [] }] },
      config: {},
      api: { i18n: { t: (text: string) => text } } as unknown as API,
      readOnly: false,
      block: {} as never,
    })
    expect(list.renderSettings().map(setting => ('label' in setting ? setting.label : ''))).toEqual([
      'Unordered',
      'Ordered',
    ])
  })

  it('should configure only the blocks the site shows, under their stored names', () => {
    const image = { pickImage: vi.fn(), uploadImage: vi.fn() }

    const tools = buildEditorTools(image)

    expect(Object.keys(tools)).toEqual([
      'header',
      'list',
      'quote',
      'image',
      'LinkTool',
      'delimiter',
      'embed',
      'table',
      'code',
    ])
    expect(tools.image).toEqual({ class: ImageTool, config: image })
    expect(tools.list).toMatchObject({ class: SiteList })
    expect(tools.LinkTool).toMatchObject({ config: { endpoint: '/api/admin/link-preview/' } })
    expect(tools.header).toMatchObject({ config: { levels: [2, 3], defaultLevel: 2 } })
  })

  it('should translate the editor to Spanish', () => {
    expect(editorMessages.toolNames).toMatchObject({ Text: 'Párrafo', Image: 'Imagen' })
  })
})
