import { describe, expect, it } from 'vitest'

import { htmlToBlocks } from './wordImport'
import { pastedListsToHtml } from './wordPaste'

// How Word puts a list item on the clipboard: the bullet is text in a span it marks to ignore.
const item = (text: string, level = 1, marker = '·') =>
  `<p class=MsoListParagraphCxSpMiddle style='margin-left:36.0pt;text-indent:-18.0pt;mso-list:l0 level${level} lfo1'>` +
  `<![if !supportLists]><span style='font-family:Symbol'><span style='mso-list:Ignore'>${marker}` +
  `<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span>` +
  `<![endif]>${text}<o:p></o:p></p>`
const clipboard = (body: string) =>
  `<html xmlns:o="urn:schemas-microsoft-com:office:office"><body lang=ES><!--StartFragment-->${body}<!--EndFragment--></body></html>`
const blocksOf = (html: string) => htmlToBlocks(pastedListsToHtml(html)!)
const entry = (content: string, items: unknown[] = []) => ({ content, meta: {}, items })

describe('pastedListsToHtml', () => {
  it('should turn Word list paragraphs into a list, between the paragraphs around it', () => {
    const html = clipboard(
      `<p class=MsoNormal>Entre las frases:</p>${item('Les vamos a clavar <b>cinco</b>')}${item('Hay que meterles 6-2')}<p class=MsoNormal>Y ganamos.</p>`,
    )

    expect(blocksOf(html)).toEqual([
      { type: 'paragraph', data: { text: 'Entre las frases:' } },
      {
        type: 'list',
        data: {
          style: 'unordered',
          meta: {},
          items: [entry('Les vamos a clavar <b>cinco</b>'), entry('Hay que meterles 6-2')],
        },
      },
      { type: 'paragraph', data: { text: 'Y ganamos.' } },
    ])
  })

  it('should keep numbered lists numbered and nest deeper levels, even one that starts deeper', () => {
    const html = clipboard(
      `<div class=WordSection1>${item('Primero', 1, '1.')}${item('Detalle', 2, 'o')}${item('Otro', 3, 'a)')}${item('Segundo', 1, '2.')}</div>` +
        `<p>Fin</p>${item('Suelto', 2)}`,
    )

    expect(blocksOf(html)).toEqual([
      {
        type: 'list',
        data: {
          style: 'ordered',
          meta: {},
          items: [entry('Primero', [entry('Detalle', [entry('Otro')])]), entry('Segundo')],
        },
      },
      { type: 'paragraph', data: { text: 'Fin' } },
      { type: 'list', data: { style: 'unordered', meta: {}, items: [entry('Suelto')] } },
    ])
  })

  it('should read Word sections and the bullets left as plain text, as in a post pasted before', () => {
    const html = clipboard(
      `<div class=WordSection1><p>·&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\nLes vamos a clavar cinco</p><p><span>•</span> Me asustan menos</p></div>`,
    )

    expect(blocksOf(html)).toEqual([
      {
        type: 'list',
        data: { style: 'unordered', meta: {}, items: [entry('Les vamos a clavar cinco'), entry('Me asustan menos')] },
      },
    ])
  })

  it('should leave pastes with no lists to the editor', () => {
    expect(pastedListsToHtml(clipboard('<p class=MsoNormal>Un párrafo</p><h2>Un título</h2>'))).toBeNull()
    // A dash starts dialogue, and a bullet with no space after it is just text.
    expect(pastedListsToHtml('<p>- Hola, dijo.</p><p>·dato</p><ul><li>Ya es lista</li></ul>')).toBeNull()
  })
})
