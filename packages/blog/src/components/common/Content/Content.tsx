import Blocks, { DataProp } from 'editorjs-blocks-react-renderer'

import { ContentImage } from './ContentImage'
import { ContentParagraph } from './ContentParagraph'

interface ContentProps {
  content: DataProp
}

export function Content({ content }: ContentProps) {
  return (
    <Blocks
      data={content}
      renderers={{
        paragraph: ContentParagraph,
        image: ContentImage,
      }}
    />
  )
}
