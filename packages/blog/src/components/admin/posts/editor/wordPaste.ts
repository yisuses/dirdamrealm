// Word copies list items as paragraphs whose bullet or number is plain text: a `mso-list` style
// gives the level, and a span marked `mso-list:Ignore` holds the bullet and the spaces after it.
const wordListItem = /mso-list:\s*l\d+\s+level(\d+)/i
const ignoredMarker = '[style*="mso-list:Ignore" i], [style*="mso-list: Ignore" i]'
// Other sources (or Word without its styles) leave only the text: a bullet, then spaces.
const typedBullet = /^\s*[·•▪◦§]\s+/
// "1.", "a)", "iv." mark a numbered list; anything else is a bullet.
const numberMarker = /^\s*[0-9a-z]{1,4}[.)]\s*$/i

interface Item {
  element: Element
  level: number
  ordered: boolean
}

/** Removes the first `count` characters of the element's text, wherever they are. */
function dropLeadingText(element: Element, count: number) {
  const walker = element.ownerDocument.createTreeWalker(element, NodeFilter.SHOW_TEXT)
  let left = count
  while (left > 0 && walker.nextNode()) {
    const text = walker.currentNode as Text
    const cut = Math.min(left, text.data.length)
    text.data = text.data.slice(cut)
    left -= cut
  }
}

function listItemOf(element: Element): Item | null {
  if (element.tagName !== 'P') {
    return null
  }
  const level = wordListItem.exec(element.getAttribute('style') ?? '')
  if (level) {
    const markers = Array.from(element.querySelectorAll(ignoredMarker))
    const marker = markers.map(span => span.textContent!).join('')
    markers.forEach(span => span.remove())
    return { element, level: Number(level[1]), ordered: numberMarker.test(marker) }
  }
  const typed = typedBullet.exec(element.textContent!)
  if (typed) {
    dropLeadingText(element, typed[0].length)
    return { element, level: 1, ordered: false }
  }
  return null
}

/** Consecutive items as one list, each deeper level a sublist of the item before it. */
function buildList(doc: Document, items: Item[]) {
  const root = doc.createElement(items[0].ordered ? 'ol' : 'ul')
  const stack = [root]
  for (const { element, level, ordered } of items) {
    while (stack.length > level) {
      stack.pop()
    }
    while (stack.length < level) {
      const parent = stack[stack.length - 1]
      const holder = (parent.lastElementChild as Element | null) ?? parent.appendChild(doc.createElement('li'))
      stack.push(holder.appendChild(doc.createElement(ordered ? 'ol' : 'ul')))
    }
    const li = doc.createElement('li')
    li.append(...Array.from(element.childNodes))
    stack[stack.length - 1].append(li)
  }
  return root
}

/**
 * What Word (or a text with typed bullets) puts on the clipboard, with its lists as real lists,
 * for `htmlToBlocks`. Null when it holds no list: the editor's own paste handles it as usual.
 */
export function pastedListsToHtml(html: string): string | null {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  // Word wraps the copy in its section divs.
  const unwrap = (element: Element): Element[] =>
    element.tagName === 'DIV' ? Array.from(element.children).flatMap(unwrap) : [element]
  const output = doc.createElement('div')
  let run: Item[] = []
  let found = false
  const flush = () => {
    if (run.length) {
      output.append(buildList(doc, run))
      run = []
      found = true
    }
  }
  for (const element of Array.from(doc.body.children).flatMap(unwrap)) {
    const item = listItemOf(element)
    if (item) {
      run.push(item)
    } else {
      flush()
      output.append(element)
    }
  }
  flush()
  return found ? output.innerHTML : null
}
