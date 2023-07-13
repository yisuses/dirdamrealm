import { DataProp } from 'editorjs-blocks-react-renderer'

import { stripTags } from '../stripTags/stripTags'

export function getPlainText(content: DataProp) {
  const plainText = content.blocks
    .filter(block => block.type === 'paragraph')
    .map(block => stripTags(block.data.text))
    .join(' ')

  return plainText
}
