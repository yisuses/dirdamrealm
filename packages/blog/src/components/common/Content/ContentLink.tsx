import { Box, Flex, Text } from '@chakra-ui/layout'
import { RenderFn } from 'editorjs-blocks-react-renderer'
import Image from 'next/image'
import NextLink from 'next/link'

export interface ContentLinkBlockData {
  link: string
  meta: {
    title: string
    description?: string
    image?: {
      url?: string
    }
  }
}

export const ContentLink: RenderFn<ContentLinkBlockData> = ({ data }) => {
  return (
    <NextLink href={data.link}>
      <Box
        borderRadius="4px"
        p="12px"
        boxShadow="0 0px 3px rgba(0,0,0,.1)"
        transition="all 0.1s ease-in"
        _hover={{
          boxShadow: '0 0 3px rgba(241, 130, 19, .7)',
        }}
      >
        <Flex justifyContent="space-between" alignItems="center">
          <Flex direction="column" justifyContent="center">
            <Text as="b" fontSize="lg">
              {data.meta.title}
            </Text>
          </Flex>
          {data.meta.image?.url && (
            <Flex width={65} height={65} minW={65} borderRadius={4} overflow="hidden" marginLeft="12px">
              <Image src={data.meta.image.url} alt={data.meta.title} width={65} height={65} />
            </Flex>
          )}
        </Flex>
        {data.meta.description && (
          <Text as="i" noOfLines={2} mt="4px">
            {data.meta.description}
          </Text>
        )}
      </Box>
    </NextLink>
  )
}
