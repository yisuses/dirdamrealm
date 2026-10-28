import { Block, DataProp } from 'editorjs-blocks-react-renderer'

// Older lists keep their items as text; the editor's keep each one with its sublist.
type ListItem = string | { content: string; items?: ListItem[] }

function countWords(text: string) {
  return text.split(/\s+/).length
}

function getWordCountFromItems(items: ListItem[]): number {
  return items.reduce(
    (acc, item) =>
      acc +
      (typeof item === 'string'
        ? countWords(item)
        : countWords(item.content) + getWordCountFromItems(item.items ?? [])),
    0,
  )
}

function getWordCountFromBlock(block: Block): number {
  try {
    switch (block.type) {
      case 'paragraph':
        return block.data.text.split(/\s+/).length
      case 'list':
        return getWordCountFromItems(block.data.items)
      case 'header':
        return block.data.text.split(/\s+/).length
      case 'image':
        return 1
      default:
        return 0
    }
  } catch {
    return 0
  }
}

export function getReadingTime(content: DataProp) {
  const wordsPerMinute = 200

  const numberOfWords = content.blocks.reduce((acc, block) => acc + getWordCountFromBlock(block), 0)

  const readingTimeInMinutes = Math.ceil(numberOfWords / wordsPerMinute)

  return readingTimeInMinutes
}
