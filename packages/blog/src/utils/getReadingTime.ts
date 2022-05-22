import { DataProp } from 'editorjs-blocks-react-renderer'

export function getReadingTime(content: DataProp) {
  const wordsPerMinute = 200
  const numberOfWords = content.blocks
    .filter(block => block.type === 'paragraph')
    .map(block => block.data.text.split(/\s+/).length)
    .reduce((a, b) => a + b, 0)
  const readingTimeInMinutes = Math.ceil(numberOfWords / wordsPerMinute)

  return readingTimeInMinutes
}
