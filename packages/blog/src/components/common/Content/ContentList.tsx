'use client'

import { List } from '@chakra-ui/react'
import { RenderFn } from 'editorjs-blocks-react-renderer'
import HTMLReactParser, { HTMLReactParserOptions } from 'html-react-parser'

/**
 * EditorJS list items come in two shapes: the legacy list tool stores plain HTML strings,
 * the nested list tool stores `{ content, items }` objects. Posts written before the
 * Strapi 5 / editor upgrade keep the legacy shape, so both must render.
 */
type ContentListItem = string | { content?: string; items?: ContentListItem[] }

export interface ContentListBlockData {
  items: ContentListItem[]
  style: 'ordered' | 'unordered'
}

const options: HTMLReactParserOptions = {}

function renderItems(items: ContentListItem[], style: ContentListBlockData['style']) {
  return items.map((item, index) => {
    const content = typeof item === 'string' ? item : (item?.content ?? '')
    const nestedItems = typeof item === 'string' ? [] : (item?.items ?? [])

    return (
      <List.Item key={index}>
        {HTMLReactParser(content, options)}
        {nestedItems.length > 0 && (
          <List.Root as={style === 'ordered' ? 'ol' : 'ul'} marginInlineStart="2em">
            {renderItems(nestedItems, style)}
          </List.Root>
        )}
      </List.Item>
    )
  })
}

export const ContentList: RenderFn<ContentListBlockData> = ({ data }) => {
  return (
    <List.Root as={data.style === 'ordered' ? 'ol' : 'ul'} mb="16px" marginInlineStart="2em">
      {renderItems(data.items ?? [], data.style)}
    </List.Root>
  )
}
