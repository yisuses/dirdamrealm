import { Box, Text } from '@chakra-ui/layout'
import { format, parseISO } from 'date-fns'
import Image from 'next/image'
import NextLink from 'next/link'
import { useTranslation } from 'next-i18next'

import { getImageUrlFromMedia } from '@utils/image'
import { buildPostPath } from '@utils/urlBuilder'
import { Tag } from '../Tag'

type SearchPostItemProps = {
  post: Post
}

export function SearchPostResultItem({
  post: { id, title, coverImage, summary, categories, publishedAt },
}: SearchPostItemProps) {
  const { t } = useTranslation('common')

  return (
    <NextLink href={buildPostPath(id, title)}>
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
            alt={t('postSearch.imageAlt', { title })}
            fill
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
              {categories?.map(({ code, localizedName }) => (
                <Tag size="sm" key={code} label={t(`categories.${code as PostCategoryCodes}`) || localizedName} />
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </NextLink>
  )
}
