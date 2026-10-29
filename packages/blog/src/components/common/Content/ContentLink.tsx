'use client'

import { Box, Flex, Text } from '@chakra-ui/react'
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
        my={6}
        p={4}
        bg="bg.panel"
        border="1px solid"
        borderColor="border"
        borderRadius="12px"
        transition="border-color .2s"
        _hover={{ borderColor: 'accent' }}
      >
        <Flex justifyContent="space-between" alignItems="center">
          <Flex direction="column" justifyContent="center">
            <Text fontWeight={600} fontSize="lg" lineHeight="1.3">
              {data.meta.title}
            </Text>
          </Flex>
          {data.meta.image?.url && (
            <Flex width={65} height={65} minW={65} borderRadius="8px" overflow="hidden" marginLeft="12px">
              <Image src={data.meta.image.url} alt={data.meta.title} width={65} height={65} />
            </Flex>
          )}
        </Flex>
        {data.meta.description && (
          <Text fontSize="16px" color="fg.muted" lineClamp={2} mt="4px">
            {data.meta.description}
          </Text>
        )}
      </Box>
    </NextLink>
  )
}
