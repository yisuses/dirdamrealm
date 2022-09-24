import { useColorModeValue } from '@chakra-ui/color-mode'
import { Text, Box, Flex, Link } from '@chakra-ui/layout'
import NextImage from 'next/image'
import NextLink from 'next/link'

import { Tag, Ribbon } from '@components'
import { buildBlurDataUrl, buildPostPath } from '@utils'

export type PostCardProps = {
  id: number
  categories: { key: string; label: string }[]
  date: string
  title: string
  description: string
  imageUrl: string
  locale: string
  isSameLocale: boolean
}

export function PostCard({ id, categories, date, description, imageUrl, title, isSameLocale, locale }: PostCardProps) {
  const postLink = buildPostPath(String(id), title)
  return (
    <Flex direction="column" w={{ base: '100%', md: '280px' }} h="450px" gap="15px">
      <Box
        w="100%"
        h="280px"
        position="relative"
        overflow="hidden"
        borderRadius="4px"
        _hover={{
          img: {
            transform: 'scale(1.1,1.1) rotate(1deg)',
            transition: 'all 1s',
          },
        }}
      >
        {!isSameLocale && <Ribbon>{locale}</Ribbon>}
        <Flex
          pl="20px"
          position="absolute"
          top="20px"
          right="24px"
          flexWrap="wrap"
          gap="10px"
          justifyContent="flex-end"
          zIndex={1}
        >
          {categories
            .sort((a, b) => a.label.length - b.label.length)
            .map(({ key, label }) => (
              <Tag key={key} label={label} />
            ))}
        </Flex>
        <NextLink href={postLink} passHref>
          <Link>
            <NextImage
              src={imageUrl}
              objectFit="cover"
              alt={`${title} image`}
              layout="fill"
              style={{ transition: 'all .5s' }}
              placeholder="blur"
              blurDataURL={buildBlurDataUrl(280, 280)}
            />
          </Link>
        </NextLink>
      </Box>
      <Text fontSize="xs" color={useColorModeValue('gray.750', 'gray.50')}>
        {date}
      </Text>
      <NextLink href={postLink} passHref>
        <Link fontSize="lg" color={useColorModeValue('gray.950', 'white')} fontWeight={700} noOfLines={2} title={title}>
          {title}
        </Link>
      </NextLink>
      <Text fontSize="xs" color={useColorModeValue('gray.750', 'gray.50')} noOfLines={3} title={description}>
        {description}
      </Text>
    </Flex>
  )
}
