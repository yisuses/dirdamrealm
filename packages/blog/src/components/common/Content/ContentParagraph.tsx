import { Text } from '@chakra-ui/layout'
import { RenderFn } from 'editorjs-blocks-react-renderer'
import HTMLReactParser, { DOMNode, Element, HTMLReactParserOptions, domToReact } from 'html-react-parser'

export interface ContentParagraphBlockData {
  text: string
}

export const ContentParagraph: RenderFn<ContentParagraphBlockData> = ({ data }) => {
  const options: HTMLReactParserOptions = {
    replace: domNode => {
      if (domNode instanceof Element) {
        if (domNode.name === 'b') {
          return <b>{domToReact(domNode.children as DOMNode[])}</b>
        }
      }
    },
  }

  return (
    <Text mb="16px" textAlign="justify">
      {data.text && HTMLReactParser(data.text, options)}
    </Text>
  )
}
