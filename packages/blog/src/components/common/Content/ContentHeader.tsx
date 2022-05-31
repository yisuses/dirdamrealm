import { Heading } from '@chakra-ui/layout'
import { RenderFn } from 'editorjs-blocks-react-renderer'
import HTMLReactParser, { HTMLReactParserOptions } from 'html-react-parser'

export interface ContentHeaderBlockData {
  text: string
}

export const ContentHeader: RenderFn<ContentHeaderBlockData> = ({ data }) => {
  const options: HTMLReactParserOptions = {}

  return (
    <Heading my="20px" fontSize={30}>
      {data.text && HTMLReactParser(data.text, options)}
    </Heading>
  )
}
