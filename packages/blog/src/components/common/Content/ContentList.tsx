'use client'

import { List } from '@chakra-ui/react'
import { RenderFn } from 'editorjs-blocks-react-renderer'
import HTMLReactParser, { HTMLReactParserOptions } from 'html-react-parser'

export interface ContentListBlockData {
  items: string[]
  style: 'ordered' | 'unordered'
}

export const ContentList: RenderFn<ContentListBlockData> = ({ data }) => {
  const options: HTMLReactParserOptions = {}

  const listItems = data.items.map((item, index) => <List.Item key={index}>{HTMLReactParser(item, options)}</List.Item>)

  return (
    <List.Root as={data.style === 'ordered' ? 'ol' : 'ul'} mb="16px" marginInlineStart="2em">
      {listItems}
    </List.Root>
  )
}
