import Blocks, { DataProp } from 'editorjs-blocks-react-renderer'

import { ContentHeader } from './ContentHeader'
import { ContentImage } from './ContentImage'
import { ContentLink } from './ContentLink'
import { ContentList } from './ContentList'
import { ContentParagraph } from './ContentParagraph'
import { ContentQuote } from './ContentQuote'

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
        quote: ContentQuote,
        LinkTool: ContentLink,
      }}
    />
  )
}
