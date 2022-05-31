import Blocks, { DataProp } from 'editorjs-blocks-react-renderer'

import { ContentHeader } from './ContentHeader'
import { ContentImage } from './ContentImage'
import { ContentList } from './ContentList'
import { ContentParagraph } from './ContentParagraph'

interface ContentProps {
  content: DataProp
}

export function Content({ content }: ContentProps) {
  return (
    <Blocks
      data={content}
      renderers={{
        header: ContentHeader,
        image: ContentImage,
        list: ContentList,
        paragraph: ContentParagraph,
      }}
    />
  )
}
