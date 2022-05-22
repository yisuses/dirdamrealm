import { Box } from '@chakra-ui/layout'
import { RenderFn } from 'editorjs-blocks-react-renderer'
import NextImage from 'next/image'

interface ContentImageBlockData {
  file: Media
}

export const ContentImage: RenderFn<ContentImageBlockData> = ({ data }) => {
  return (
    <Box w="100%" h={`${data.file.height}px`} position="relative" display="flex" justifyContent="center" my="32px">
      <NextImage
        src={data.file.url}
        alt={data.file.caption}
        objectFit="cover"
        height={`${data.file.height}px`}
        width={`${data.file.width}px`}
      />
    </Box>
  )
}
