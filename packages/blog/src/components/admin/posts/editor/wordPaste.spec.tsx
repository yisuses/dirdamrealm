import { describe, expect, it } from 'vitest'

import { htmlToBlocks } from './wordImport'
import { pastedFormattingToTags, pastedListsToHtml } from './wordPaste'

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

describe('pastedFormattingToTags', () => {
  it('should turn <em> and <strong> into the <i> and <b> the editor keeps', () => {
    expect(pastedFormattingToTags('<p>Uno <em>cursiva</em> y <strong>negrita</strong></p>')).toBe(
      '<p>Uno <i>cursiva</i> y <b>negrita</b></p>',
    )
  })

  it('should read italics and bold from a style, as Word on the web and Google Docs mark them', () => {
    const html =
      '<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-1"><p dir="ltr">' +
      '<span style="font-weight:400;font-style:italic;">cursiva</span><span style="font-weight:400;"> y </span>' +
      '<span style="font-weight:700;">negrita</span> <span style="font-style: oblique; font-weight: bold">ambas</span>' +
      '</p></b><p style="font-style:italic"><i style="font-style:normal">recta</i> resto</p>'

    expect(pastedFormattingToTags(html)).toBe(
      '<p dir="ltr">' +
        '<span style="font-weight:400;font-style:italic;"><i>cursiva</i></span><span style="font-weight:400;"> y </span>' +
        '<span style="font-weight:700;"><b>negrita</b></span> <span style="font-style: oblique; font-weight: bold"><i><b>ambas</b></i></span>' +
        '</p><p style="font-style:italic"><i>recta resto</i></p>',
    )
  })

  it('should leave alone what holds only <i>, <b> and plain text, as Word on the desktop copies', () => {
    expect(
      pastedFormattingToTags(clipboard(`<p class=MsoNormal>Hola <i><span>cursiva</span></i> <b>fin</b></p>`)),
    ).toBeNull()
    expect(pastedFormattingToTags('Solo texto')).toBeNull()
  })

  it('should keep the italics of list items for the list paste', () => {
    const html = pastedFormattingToTags(clipboard(item('Hay que <span style="font-style:italic">meterles</span> 6-2')))!

    expect(blocksOf(html)).toEqual([
      { type: 'list', data: { style: 'unordered', meta: {}, items: [entry('Hay que <i>meterles</i> 6-2')] } },
    ])
  })
})
