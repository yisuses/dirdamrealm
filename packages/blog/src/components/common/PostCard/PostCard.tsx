import { useColorModeValue } from '@chakra-ui/color-mode'
import { Image } from '@chakra-ui/image'
import { Text, Box, Flex, Link as ChakraLink } from '@chakra-ui/layout'
import Link from 'next/link'
import { ReactNode } from 'react'

import { Tag } from '@components'
import { buildPostPath } from '@utils'

type PostCardCommonProps = {
  id: number
  categories: { key: string; label: string }[]
  date: string
  title: string
  description: string
}

type PostCardWithImageProps = PostCardCommonProps & {
  image: ReactNode
  imageUrl?: never
}

type PostCardWithImageUrlProps = PostCardCommonProps & {
  image?: never
  imageUrl: string
}

export type PostCardProps = PostCardWithImageProps | PostCardWithImageUrlProps

export function PostCard({ id, categories, date, description, imageUrl, title, image }: PostCardProps) {
  return (
    <Flex direction="column" w={{ base: '100%', md: '280px' }} h="450px" gap="15px">
      <Box w="100%" h="280px" position="relative">
        <Flex
          pl="20px"
          position="absolute"
          top="20px"
          right="24px"
          flexWrap="wrap"
          gap="10px"
          justifyContent="flex-end"
        >
          {categories
            .sort((a, b) => a.label.length - b.label.length)
            .map(({ key, label }) => (
              <Tag key={key} label={label} />
            ))}
        </Flex>
        {imageUrl && (
          <Image borderRadius="4px" h="280px" w="100%" objectFit="cover" src={imageUrl} alt={`${title} image`} />
        )}
        {image}
      </Box>
      <Text fontSize="xs" color={useColorModeValue('gray.750', 'gray.50')}>
        {date}
      </Text>
      <Link href={buildPostPath(String(id), title)} passHref>
        <ChakraLink>
          <Text
            fontSize="lg"
            color={useColorModeValue('gray.950', 'white')}
            fontWeight={700}
            noOfLines={2}
            title={title}
          >
            {title}
          </Text>
        </ChakraLink>
      </Link>
      <Text fontSize="xs" color={useColorModeValue('gray.750', 'gray.50')} noOfLines={3} title={description}>
        {description}
      </Text>
    </Flex>
  )
}
