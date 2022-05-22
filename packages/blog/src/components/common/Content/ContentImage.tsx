import { Box } from '@chakra-ui/layout'
import { RenderFn } from 'editorjs-blocks-react-renderer'
import NextImage from 'next/image'

interface ContentImageBlockData {
  caption?: string
  file: Media
}

export const ContentImage: RenderFn<ContentImageBlockData> = ({ data }) => {
  console.log(data)
  return (
    <Box w="100%" h={`${data.file.height}px`} position="relative" display="flex" justifyContent="center" my="32px">
      <NextImage
        src={data.file.url}
        alt={data.caption}
        objectFit="cover"
        height={`${data.file.height}px`}
        width={`${data.file.width}px`}
      />
    </Box>
  )
}
