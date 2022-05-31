import { ListItem, OrderedList, UnorderedList } from '@chakra-ui/layout'
import { RenderFn } from 'editorjs-blocks-react-renderer'
import HTMLReactParser, { HTMLReactParserOptions } from 'html-react-parser'

export interface ContentListBlockData {
  items: string[]
  style: 'ordered' | 'unordered'
}

export const ContentList: RenderFn<ContentListBlockData> = ({ data }) => {
  const options: HTMLReactParserOptions = {}

  const listItems = data.items.map((item, index) => <ListItem key={index}>{HTMLReactParser(item, options)}</ListItem>)
  const ListType = data.style === 'ordered' ? OrderedList : UnorderedList

  return (
    <ListType mb="16px" marginInlineStart="2em">
      {listItems}
    </ListType>
  )
}
