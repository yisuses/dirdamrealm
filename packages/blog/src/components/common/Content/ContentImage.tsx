import { Box, Text } from '@chakra-ui/layout'
import { RenderFn } from 'editorjs-blocks-react-renderer'
import NextImage from 'next/image'

import { buildBlurDataUrl } from '@utils'

interface ContentImageBlockData {
  caption?: string
  file: Media
}

export const ContentImage: RenderFn<ContentImageBlockData> = ({ data }) => {
  return (
    <Box w="100%" position="relative" display="flex" flexDirection="column" justifyContent="center" my="32px">
      <NextImage
        src={data.file.url}
        alt={data.caption || 'image caption'}
        height={data.file.height}
        width={data.file.width}
        placeholder="blur"
        blurDataURL={buildBlurDataUrl(data.file.height, data.file.width)}
      />
      <Text align="center" fontStyle="italic" fontSize="0.75rem" marginTop="12px">
        {data.caption}
      </Text>
    </Box>
  )
}
