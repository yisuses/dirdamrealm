import { chakra } from '@chakra-ui/react'
import { RenderFn } from 'editorjs-blocks-react-renderer'
import HTMLReactParser from 'html-react-parser'

import { useColorModeValue } from '@blog/components/ui/color-mode'

export interface ContentQuoteBlockData {
  text: string
  caption?: string
  alignment?: 'left' | 'center'
}

export const ContentQuote: RenderFn<ContentQuoteBlockData> = ({ data }) => {
  const quoteColor = useColorModeValue('blackAlpha.700', 'white')
  return (
    <>
      <QuoteText bgColor="blackAlpha.100" color={quoteColor}>
        {data.text && HTMLReactParser(data.text)}
      </QuoteText>
      {data.caption && <QuoteFooter color={quoteColor}>{data.caption}</QuoteFooter>}
    </>
  )
}

const QuoteText = chakra('blockquote', {
  base: {
    borderLeft: '4px solid',
    borderLeftColor: 'orange.300',
    padding: '0.5rem 1rem',
    margin: '0.5rem 0',
    fontStyle: 'italic',
    fontSize: '1.2rem',
    lineHeight: '1.5',
    borderRadius: '0.25rem',
    '&:before': {
      content: '"\\201C"',
      fontSize: '2.5rem',
      lineHeight: '0.5',
      marginRight: '0.25rem',
      color: 'orange.300',
    },
    '&:after': {
      content: '"\\201D"',
      fontSize: '2.5rem',
      lineHeight: '0.5',
      marginLeft: '0.25rem',
      color: 'orange.300',
    },
  },
})

const QuoteFooter = chakra('footer', {
  base: {
    color: 'gray.500',
    fontSize: '0.8rem',
    fontWeight: '500',
    lineHeight: '1.5',
    marginTop: '0.5rem',
    marginBottom: '0.5rem',
    fontStyle: 'italic',
  },
})
