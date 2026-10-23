import { describe, expect, it, vi } from 'vitest'

import { htmlToBlocks, wordToBlocks } from './wordImport'

const mammoth = vi.hoisted(() => ({
  convertToHtml: vi.fn(),
  images: { imgElement: vi.fn((convert: unknown) => convert) },
}))
vi.mock('mammoth', () => ({ default: mammoth }))

const paragraphs = (...texts: string[]) => texts.map(text => ({ type: 'paragraph', data: { text } }))

describe('htmlToBlocks', () => {
  it('should turn titles, paragraphs, list items and table cells into paragraphs, in order', () => {
    expect(
      htmlToBlocks(
        '<h1>Crónica</h1><p>Primero</p><h3>Detalle</h3>' +
          '<ul><li>Uno<ol><li>Uno.uno</li></ol></li><li>Dos</li></ul>' +
          '<table><tr><th>Equipo</th><td><p>Goles</p></td></tr></table><p>Fin</p>',
      ),
    ).toEqual(paragraphs('Crónica', 'Primero', 'Detalle', 'Uno', 'Uno.uno', 'Dos', 'Equipo', 'Goles', 'Fin'))
  })

  it('should keep only bold, italic, line breaks and web links, unwrapping everything else', () => {
    expect(
      htmlToBlocks(
        '<p><strong>Negrita</strong> <em>cursiva</em> <b>b</b> <i>i</i><br><span style="color:red"><font>Raro</font></span> ' +
          '<a href="https://example.com">enlace</a> <a href="javascript:alert(1)">malo</a> <a>sin href</a><!-- nota --></p>',
      ),
    ).toEqual(
      paragraphs(
        '<b>Negrita</b> <i>cursiva</i> <b>b</b> <i>i</i><br>Raro <a href="https://example.com">enlace</a> malo sin href',
      ),
    )
  })

  it('should leave images out and drop what ends up empty', () => {
    expect(
      htmlToBlocks('<p>Antes <img src="a.png"></p><p><img src=""></p><p>  </p><h2></h2><div>Suelto</div>'),
    ).toEqual(paragraphs('Antes'))
  })
})

describe('wordToBlocks', () => {
  it('should read the document without its images', async () => {
    mammoth.convertToHtml.mockResolvedValue({ value: '<p>Hola</p><p><img src=""></p>', messages: [] })

    await expect(wordToBlocks(new File(['docx'], 'cronica.docx'))).resolves.toEqual(paragraphs('Hola'))

    const [input, options] = mammoth.convertToHtml.mock.calls[0]!
    expect(input.arrayBuffer).toBeInstanceOf(ArrayBuffer)
    await expect((options.convertImage as () => Promise<unknown>)()).resolves.toEqual({ src: '' })
  })
})
