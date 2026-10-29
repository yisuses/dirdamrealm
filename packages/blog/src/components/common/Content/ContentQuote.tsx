'use client'

import { chakra } from '@chakra-ui/react'
import { RenderFn } from 'editorjs-blocks-react-renderer'
import HTMLReactParser from 'html-react-parser'

export interface ContentQuoteBlockData {
  text: string
  caption?: string
  alignment?: 'left' | 'center'
}

export const ContentQuote: RenderFn<ContentQuoteBlockData> = ({ data }) => {
  return (
    <QuoteText>
      {data.text && HTMLReactParser(data.text)}
      {data.caption && <QuoteFooter>— {data.caption}</QuoteFooter>}
    </QuoteText>
  )
}

const QuoteText = chakra('blockquote', {
  base: {
    borderLeft: '3px solid',
    borderLeftColor: 'accent',
    margin: '2em 0',
    padding: '4px 0 4px 28px',
    fontStyle: 'italic',
    fontSize: { base: '22px', md: '27px' },
    lineHeight: '1.4',
  },
})

const QuoteFooter = chakra('footer', {
  base: {
    display: 'block',
    marginTop: '10px',
    fontFamily: 'sans',
    fontSize: '14px',
    fontStyle: 'normal',
    color: 'fg.muted',
  },
})
