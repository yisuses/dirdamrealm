import { useColorModeValue } from '@chakra-ui/color-mode'
import { Image } from '@chakra-ui/image'
import { Text, Box, Flex } from '@chakra-ui/layout'
import { ReactNode } from 'react'

import { Tag } from '@/components'

type PostCardCommonProps = {
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

export function PostCard({ categories, date, description, imageUrl, title, image }: PostCardProps) {
  return (
    <Flex direction="column" w={{ base: '240px', md: '310px' }} h="450px" gap="15px">
      <Box w={{ base: '240px', md: '310px' }} h={{ base: '210px', md: '280px' }} position="relative">
        <Flex
          pl="20px"
          position="absolute"
          top="20px"
          right="20px"
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
          <Image
            borderRadius="5px"
            h={{ base: '210px', md: '280px' }}
            objectFit="cover"
            src={imageUrl}
            alt={`${title} image`}
          />
        )}
        {image}
      </Box>
      <Text fontSize="xs" color={useColorModeValue('gray.750', 'gray.50')}>
        {date}
      </Text>
      <Text fontSize="lg" color={useColorModeValue('gray.950', 'white')} fontWeight={700} noOfLines={2}>
        {title}
      </Text>
      <Text fontSize="xs" color={useColorModeValue('gray.750', 'gray.50')} noOfLines={3}>
        {description}
      </Text>
    </Flex>
  )
}
