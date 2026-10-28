/* eslint-disable @typescript-eslint/naming-convention -- tools are classes, and `LinkTool` is the block's stored name */
import Code from '@editorjs/code'
import Delimiter from '@editorjs/delimiter'
import type { ToolConstructable, ToolSettings, ToolboxConfigEntry } from '@editorjs/editorjs'
import Embed from '@editorjs/embed'
import Header from '@editorjs/header'
import LinkTool from '@editorjs/link'
import List from '@editorjs/list'
import Quote from '@editorjs/quote'
import Table from '@editorjs/table'

import { ImageTool, type ImageToolConfig } from './ImageTool'

/**
 * Lists without what the site does not show: checklists, and numbering that starts elsewhere
 * or uses letters. The first two settings are bullets and numbers.
 */
export class SiteList extends List {
  static get toolbox() {
    return (List.toolbox as ToolboxConfigEntry[]).filter(entry => entry.data?.style !== 'checklist')
  }

  renderSettings() {
    return super.renderSettings().slice(0, 2)
  }
}

/**
 * Only the blocks the site knows how to show, under the names posts already use (`LinkTool` is
 * how Strapi's editor called the link block). Loaded in the browser only: the tools need `window`.
 */
export function buildEditorTools(image: ImageToolConfig): Record<string, ToolConstructable | ToolSettings> {
  return {
    header: {
      class: Header as unknown as ToolConstructable,
      inlineToolbar: true,
      config: { levels: [2, 3], defaultLevel: 2, placeholder: 'Título de sección' },
    },
    list: { class: SiteList as unknown as ToolConstructable, inlineToolbar: true, config: { maxLevel: 3 } },
    quote: {
      class: Quote as unknown as ToolConstructable,
      inlineToolbar: true,
      config: { quotePlaceholder: 'Texto de la cita', captionPlaceholder: 'Quién lo dijo' },
    },
    image: { class: ImageTool as unknown as ToolConstructable, config: image },
    LinkTool: { class: LinkTool, config: { endpoint: '/api/admin/link-preview/' } },
    delimiter: Delimiter as unknown as ToolConstructable,
    // No toolbox entry: pasting a YouTube, Vimeo, Instagram, X or Facebook link creates it.
    embed: {
      class: Embed as unknown as ToolConstructable,
      config: { services: { youtube: true, vimeo: true, instagram: true, twitter: true, facebook: true } },
    },
    table: { class: Table as unknown as ToolConstructable, inlineToolbar: true },
    code: Code as unknown as ToolConstructable,
  }
}
