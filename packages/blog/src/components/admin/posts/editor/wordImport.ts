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

// As deep as the editor's lists go (its `maxLevel`).
const maxListLevel = 3

interface ListItem {
  content: string
  meta: Record<string, never>
  items: ListItem[]
}

const isList = (element: Element) => element.tagName === 'UL' || element.tagName === 'OL'

/** A list's items with their sublists; levels past the editor's last one join that level. */
function listItems(list: Element, level: number): ListItem[] {
  return Array.from(list.children)
    .filter(child => child.tagName === 'LI')
    .flatMap(li => {
      const own = li.cloneNode(true) as Element
      own.querySelectorAll('ul, ol, img').forEach(child => child.remove())
      const content = cleanInline(own)
      const items = Array.from(li.children)
        .filter(isList)
        .flatMap(sublist => listItems(sublist, level + 1))
      if (level >= maxListLevel) {
        return [...(content ? [{ content, meta: {}, items: [] }] : []), ...items]
      }
      // An item with no text of its own (Word's way to start a list one level down) leaves its sublist in its place.
      return content ? [{ content, meta: {}, items }] : items
    })
}

function paragraphsOf(element: Element): OutputBlockData[] {
  const elements = element.matches(textElements) ? [element] : Array.from(element.querySelectorAll(textElements))
  return elements.flatMap(textElement => {
    const own = textElement.cloneNode(true) as Element
    // A cell's paragraphs, or a list item's sublist inside a table, are paragraphs of their own.
    own.querySelectorAll(`${textElements}, ul, ol, img`).forEach(child => child.remove())
    const text = cleanInline(own)
    return text ? [{ type: 'paragraph', data: { text } }] : []
  })
}

/**
 * The HTML mammoth makes of a Word document, as the post's blocks, in order: lists stay lists,
 * numbered or with bullets, and titles and table cells become paragraphs. Images are left out.
 */
export function htmlToBlocks(html: string): OutputBlockData[] {
  const body = new DOMParser().parseFromString(html, 'text/html').body
  return Array.from(body.children).flatMap((element): OutputBlockData[] => {
    if (!isList(element)) {
      return paragraphsOf(element)
    }
    const items = listItems(element, 1)
    const style = element.tagName === 'OL' ? 'ordered' : 'unordered'
    return items.length ? [{ type: 'list', data: { style, meta: {}, items } }] : []
  })
}

/** What an import added, for the writer: "3 párrafos y 1 lista". */
export function describeBlocks(blocks: OutputBlockData[]) {
  const lists = blocks.filter(block => block.type === 'list').length
  const paragraphs = blocks.length - lists
  const count = (amount: number, one: string, many: string) => `${amount} ${amount === 1 ? one : many}`
  return [
    paragraphs || !lists ? count(paragraphs, 'párrafo', 'párrafos') : '',
    lists ? count(lists, 'lista', 'listas') : '',
  ]
    .filter(Boolean)
    .join(' y ')
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
