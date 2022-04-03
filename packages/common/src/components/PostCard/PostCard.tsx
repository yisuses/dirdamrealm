import { Text, Box, Flex, Image } from '@chakra-ui/react'
import { ReactNode } from 'react'
import { Tag } from '../Tag/Tag'

type PostCardCommonProps = {
  categories: string[]
  date: string
  title: string
  description: string
}

type PostCardWithImageProps = PostCardCommonProps & {
  image: ReactNode
  imageUrl: never
}

type PostCardWithImageUrlProps = PostCardCommonProps & {
  image: never
  imageUrl: string
}

export type PostCardProps = PostCardWithImageProps | PostCardWithImageUrlProps

export function PostCard({ categories, date, description, imageUrl, title, image }: PostCardProps) {
  return (
    <Flex direction="column" w="310px" h="450px" gap="15px">
      <Box w="310px" h="280px" position="relative">
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
            .sort((a, b) => a.length - b.length)
            .map((label, index) => (
              <Tag key={index} label={label} />
            ))}
        </Flex>
        {imageUrl && <Image borderRadius="5px" h="280px" objectFit="cover" src={imageUrl} alt={`${title} image`} />}
        {image}
      </Box>
      <Text fontSize="xs" color="gray.750">
        {date}
      </Text>
      <Text fontSize="lg" color="gray.950" fontWeight={700}>
        {title}
      </Text>
      <Text fontSize="xs" color="gray.750">
        {description}
      </Text>
    </Flex>
  )
}
