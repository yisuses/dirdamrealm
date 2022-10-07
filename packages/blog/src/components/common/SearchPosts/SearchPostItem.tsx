import { Box, Text } from '@chakra-ui/layout'
import { format, parseISO } from 'date-fns'
import Image from 'next/image'
import NextLink from 'next/link'

import { getImageUrlFromMedia } from '@utils/image'
import { buildPostPath } from '@utils/urlBuilder'
import { Tag } from '../Tag'

type SearchPostItemProps = {
  post: AlgoliaPostEntity
}

export function SearchPostResultItem({
  post: { objectID, title, coverImage, summary, categories, publishedAt },
}: SearchPostItemProps) {
  return (
    <NextLink href={buildPostPath(objectID, title)}>
      <Box display="flex" alignItems="center" py={{ base: '8px', lg: '16px' }} _hover={{ cursor: 'pointer' }}>
        <Box
          position="relative"
          height={{ base: '80px', lg: '120px' }}
          borderRadius="4px"
          overflow="hidden"
          flexGrow={1}
          maxW={{ base: '100px', lg: '200px' }}
          minW={{ base: '100px', lg: '200px' }}
        >
          <Image
            src={getImageUrlFromMedia({
              media: coverImage,
              format: 'thumbnail',
            })}
            layout="fill"
            objectFit="cover"
            priority
          />
        </Box>
        <Box
          marginLeft="20px"
          display="flex"
          flexDir="column"
          height={{ base: '80px', lg: '120px' }}
          flexGrow={1}
          pt={{ base: 0, lg: '8px' }}
        >
          <Text fontSize={{ base: 'sm', md: 'md', lg: 'xl' }} fontWeight={600}>
            {title}
          </Text>
          <Text fontSize={{ base: 'xs', md: 'sm', lg: 'md' }} fontStyle="italic" noOfLines={2}>
            {summary}
          </Text>
          <Box marginTop="auto" display="flex" justifyContent="space-between" alignItems="center">
            <Text fontSize={{ base: 'xs', md: 'sm', lg: 'md' }}>{format(parseISO(publishedAt), 'dd.MM.yyyy')}</Text>
            <Box display={{ base: 'none', lg: 'flex' }}>
              {categories.map(({ name, code }) => (
                <Tag size="sm" key={code} label={name} />
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </NextLink>
  )
}
