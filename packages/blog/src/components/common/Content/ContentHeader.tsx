'use client'

import { Heading } from '@chakra-ui/react'
import { RenderFn } from 'editorjs-blocks-react-renderer'
import HTMLReactParser, { HTMLReactParserOptions } from 'html-react-parser'

export interface ContentHeaderBlockData {
  text: string
}

export const ContentHeader: RenderFn<ContentHeaderBlockData> = ({ data }) => {
  const options: HTMLReactParserOptions = {}

  return (
    <Heading as="h2" fontSize={{ base: '27px', md: '32px' }} lineHeight="1.2" fontWeight={500} mt="1.6em" mb="0.5em">
      {data.text && HTMLReactParser(data.text, options)}
    </Heading>
  )
}
