import { Box } from '@chakra-ui/layout'
import { RenderFn } from 'editorjs-blocks-react-renderer'
import NextImage from 'next/image'

import { buildBlurDataUrl } from '@utils'

interface ContentImageBlockData {
  caption?: string
  file: Media
}

export const ContentImage: RenderFn<ContentImageBlockData> = ({ data }) => {
  return (
    <Box w="100%" position="relative" display="flex" justifyContent="center" my="32px">
      <NextImage
        src={data.file.url}
        alt={data.caption}
        objectFit="contain"
        height={`${data.file.height}px`}
        width={`${data.file.width}px`}
        placeholder="blur"
        blurDataURL={buildBlurDataUrl(data.file.height, data.file.width)}
      />
    </Box>
  )
}
