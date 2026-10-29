'use client'

import { Box, Text } from '@chakra-ui/react'
import { useParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'

import { PageHeading, PostGrid } from '@blog/components/common'
import { useGetData } from '@blog/hooks'
import { getCategoryCodeKey, getLatestPostsKey } from '@blog/utils/constants'

export function CategoryPage() {
  const { t } = useTranslation('categoryPage')
  const { categoryCode } = useParams<{ categoryCode: string }>()
  const latestPosts = useGetData<Post[]>(getLatestPostsKey(String(categoryCode)), [])
  const categories = useGetData<Category[]>(getCategoryCodeKey(categoryCode as string))

  if (!categories) {
    return null
  }

  const category = categories[0]

  return (
    <Box maxW="1248px" mx="auto" px={{ base: 4, md: 6 }}>
      <PageHeading
        kicker={t('categoryPage.kicker')}
        title={category.localizedName}
        description={latestPosts.length ? t('categoryPage.count', { count: latestPosts.length }) : undefined}
      />
      <Box mt={{ base: 6, md: 10 }}>
        {latestPosts.length > 0 ? (
          <PostGrid posts={latestPosts} />
        ) : (
          <Text color="fg.muted">{t('categoryPage.noPublishedArticles')}</Text>
        )}
      </Box>
    </Box>
  )
}
