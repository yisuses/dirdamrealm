import { Block, DataProp } from 'editorjs-blocks-react-renderer'

function getWordCountFromBlock(block: Block): number {
  try {
    switch (block.type) {
      case 'paragraph':
        return block.data.text.split(/\s+/).length
      case 'list':
        return block.data.items.reduce((acc: number, item: string) => acc + item.split(/\s+/).length, 0)
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
