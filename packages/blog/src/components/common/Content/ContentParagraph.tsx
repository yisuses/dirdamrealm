import { Text } from '@chakra-ui/layout'
import { RenderFn } from 'editorjs-blocks-react-renderer'

export interface ContentParagraphBlockData {
  text: string
}

export const ContentParagraph: RenderFn<ContentParagraphBlockData> = ({ data }) => {
  return <Text mb="8px">{data.text}</Text>
}
