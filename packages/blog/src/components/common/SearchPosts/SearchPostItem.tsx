'use client'

import { Box, Flex, Text } from '@chakra-ui/react'
import Image from 'next/image'
import NextLink from 'next/link'
import { useTranslation } from 'react-i18next'

import { useLocalizeHref } from '@blog/hooks'
import { formatPostDate } from '@blog/utils'
import { getImageUrlFromMedia } from '@blog/utils/image/image'
import { buildPostPath } from '@blog/utils/urlBuilder'

import { Tag } from '../Tag'

type SearchPostItemProps = {
  post: Post
}

export function SearchPostResultItem({
  post: { id, title, coverImage, summary, categories, publishedAt },
}: SearchPostItemProps) {
  const { t } = useTranslation('common')
  const localizeHref = useLocalizeHref()
  const parsedDate = formatPostDate(publishedAt)

  return (
    <Flex asChild gap={4} alignItems="center" px={3} py={2.5} borderRadius="10px" _hover={{ bg: 'accent.soft' }}>
      <NextLink href={localizeHref(buildPostPath(id, title))}>
        <Box position="relative" width="84px" height="60px" borderRadius="8px" overflow="hidden" flex="none">
          <Image
            src={getImageUrlFromMedia({
              media: coverImage,
              format: 'thumbnail',
            })}
            alt={t('postSearch.imageAlt', { title })}
            fill
            sizes="84px"
            style={{ objectFit: 'cover' }}
          />
        </Box>
        <Box minW={0}>
          <Flex gap={2.5} flexWrap="wrap">
            {categories?.map(({ code, localizedName }) => (
              <Tag key={code} label={t(`categories.${code as PostCategoryCodes}`) || localizedName} />
            ))}
          </Flex>
          <Text fontSize="19px" fontWeight={500} lineHeight="1.3">
            {title}
          </Text>
          <Text fontSize="15px" fontStyle="italic" color="fg.muted" lineClamp={1}>
            {summary}
          </Text>
          <Text fontFamily="sans" fontSize="13px" color="fg.muted">
            {parsedDate}
          </Text>
        </Box>
      </NextLink>
    </Flex>
  )
}
