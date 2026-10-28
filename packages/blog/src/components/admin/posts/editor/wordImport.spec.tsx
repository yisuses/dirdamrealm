import { describe, expect, it, vi } from 'vitest'

import { describeBlocks, htmlToBlocks, wordToBlocks } from './wordImport'

const mammoth = vi.hoisted(() => ({
  convertToHtml: vi.fn(),
  images: { imgElement: vi.fn((convert: unknown) => convert) },
}))
vi.mock('mammoth', () => ({ default: mammoth }))

const paragraphs = (...texts: string[]) => texts.map(text => ({ type: 'paragraph', data: { text } }))
const item = (content: string, ...items: object[]) => ({ content, meta: {}, items })
const list = (style: 'ordered' | 'unordered', ...items: object[]) => ({
  type: 'list',
  data: { style, meta: {}, items },
})

describe('htmlToBlocks', () => {
  it('should turn titles and table cells into paragraphs and keep lists as lists, in order', () => {
    expect(
      htmlToBlocks(
        '<h1>Crónica</h1><p>Primero</p><h3>Detalle</h3>' +
          '<ol><li><strong>Uno</strong><ul><li>Uno.uno</li></ul></li><li>Dos</li></ol>' +
          '<ul><li>Suelta</li></ul>' +
          '<table><tr><th>Equipo</th><td><p>Goles</p><ul><li>En la tabla</li></ul></td></tr></table><p>Fin</p>',
      ),
    ).toEqual([
      ...paragraphs('Crónica', 'Primero', 'Detalle'),
      list('ordered', item('<b>Uno</b>', item('Uno.uno')), item('Dos')),
      list('unordered', item('Suelta')),
      ...paragraphs('Equipo', 'Goles', 'En la tabla', 'Fin'),
    ])
  })

  it('should keep lists as deep as the editor allows, joining deeper items to its last level', () => {
    expect(
      htmlToBlocks(
        '<ol><li>1<ol><li>1.1<ol><li>1.1.1<ol><li>1.1.1.1<ol><li>1.1.1.1.1</li></ol></li><li></li></ol></li></ol></li></ol></li></ol>',
      ),
    ).toEqual([list('ordered', item('1', item('1.1', item('1.1.1'), item('1.1.1.1'), item('1.1.1.1.1'))))])
  })

  it('should lift the sublist of an item without text, and drop lists left empty', () => {
    expect(htmlToBlocks('<ol><li><ol><li>Dentro</li></ol></li><li>Fuera</li></ol><ul><li> </li></ul>')).toEqual([
      list('ordered', item('Dentro'), item('Fuera')),
    ])
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

describe('describeBlocks', () => {
  it('should count paragraphs and lists, in singular or plural', () => {
    const [paragraph] = paragraphs('Hola')
    const numbered = list('ordered', item('Uno'))

    expect(describeBlocks([paragraph!])).toBe('1 párrafo')
    expect(describeBlocks([paragraph!, paragraph!])).toBe('2 párrafos')
    expect(describeBlocks([numbered])).toBe('1 lista')
    expect(describeBlocks([paragraph!, numbered, numbered])).toBe('1 párrafo y 2 listas')
    expect(describeBlocks([])).toBe('0 párrafos')
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
