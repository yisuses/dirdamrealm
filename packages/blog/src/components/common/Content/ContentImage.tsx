'use client'

import { Box, Text } from '@chakra-ui/react'
import { RenderFn } from 'editorjs-blocks-react-renderer'
import NextImage from 'next/image'

import { buildBlurDataUrl } from '@blog/utils'

interface ContentImageBlockData {
  caption?: string
  file: Media
}

export const ContentImage: RenderFn<ContentImageBlockData> = ({ data }) => {
  return (
    <Box
      as="figure"
      position="relative"
      display="flex"
      flexDirection="column"
      alignItems="center"
      my={9}
      mx={{ base: 0, lg: '-60px' }}
    >
      <NextImage
        src={data.file.url}
        alt={data.caption || 'image caption'}
        height={data.file.height}
        width={data.file.width}
        style={{ maxWidth: '100%', height: 'auto', borderRadius: 12 }}
        placeholder="blur"
        blurDataURL={buildBlurDataUrl(data.file.height, data.file.width)}
      />
      <Text as="figcaption" textAlign="center" fontFamily="sans" fontSize="14px" color="fg.muted" mt={2.5}>
        {data.caption}
      </Text>
    </Box>
  )
}
