import type { OutputBlockData } from '@editorjs/editorjs'

/**
 * Only the inline formatting the site shows (bold, italic, links, line breaks): everything else
 * Word brings (spans, fonts, colors) is unwrapped and its text kept.
 */
export function cleanInline(element: Element): string {
  const doc = element.ownerDocument
  const clean = (node: Node): Node[] => {
    if (node.nodeType === Node.TEXT_NODE) {
      return [doc.createTextNode((node as Text).data)]
    }
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return []
    }
    const source = node as Element
    const children = Array.from(source.childNodes).flatMap(clean)
    const tag = source.tagName.toLowerCase()
    const keep = { b: 'b', strong: 'b', i: 'i', em: 'i', br: 'br' }[tag]
    const href = tag === 'a' ? source.getAttribute('href') : null
    if (!keep && !(href && /^https?:\/\//i.test(href))) {
      return children
    }
    const copy = doc.createElement(keep ?? 'a')
    if (href && !keep) {
      copy.setAttribute('href', href)
    }
    copy.append(...children)
    return [copy]
  }
  const wrapper = doc.createElement('div')
  wrapper.append(...Array.from(element.childNodes).flatMap(clean))
  return wrapper.innerHTML.replace(/\s+/g, ' ').trim()
}

// Every piece of text Word can hold: titles, paragraphs, list items and table cells.
const textElements = 'p, h1, h2, h3, h4, h5, h6, li, td, th'

/**
 * The HTML mammoth makes of a Word document, as the post's paragraphs, in order. Titles and list
 * items become paragraphs too; images are left out.
 */
export function htmlToBlocks(html: string): OutputBlockData[] {
  const body = new DOMParser().parseFromString(html, 'text/html').body
  return Array.from(body.querySelectorAll(textElements)).flatMap(element => {
    const own = element.cloneNode(true) as Element
    // A list item's sublist, or a cell's paragraphs, are paragraphs of their own.
    own.querySelectorAll(`${textElements}, ul, ol, img`).forEach(child => child.remove())
    const text = cleanInline(own)
    return text ? [{ type: 'paragraph', data: { text } }] : []
  })
}

/** Reads a .docx in the browser, as paragraphs for the post. */
export async function wordToBlocks(file: File) {
  const { default: mammoth } = await import('mammoth')
  const result = await mammoth.convertToHtml(
    { arrayBuffer: await file.arrayBuffer() },
    // Images are not imported: an empty source keeps mammoth from inlining them.
    { convertImage: mammoth.images.imgElement(async () => ({ src: '' })) },
  )
  return htmlToBlocks(result.value)
}
