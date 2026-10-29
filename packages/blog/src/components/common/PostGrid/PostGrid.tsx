'use client'

import { SimpleGrid } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

import { PostCard } from '@blog/components/common'
import { useLocale } from '@blog/hooks'
import { getImageUrlFromMedia } from '@blog/utils'

interface PostGridProps {
  posts: Post[]
  limit?: number
}

export function PostGrid({ posts, limit }: PostGridProps) {
  const locale = useLocale()
  const { t } = useTranslation('common')

  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} columnGap={8} rowGap={{ base: 9, md: 11 }}>
      {posts
        .slice(0, limit)
        .map(({ id, categories, publishedAt, coverImage, title, summary, imgUrl, locale: postLocale }) => (
          <PostCard
            isSameLocale={locale === postLocale}
            locale={t(`localization.${postLocale}`)}
            key={id}
            id={id}
            categories={
              categories
                ? categories.map(({ code, localizedName }) => ({
                    key: code,
                    label: t(`categories.${code as PostCategoryCodes}`) || localizedName,
                  }))
                : []
            }
            date={publishedAt}
            imageUrl={getImageUrlFromMedia({ media: coverImage, format: 'medium', fallback: imgUrl })}
            imageFocus={coverImage?.focus}
            imageFit={coverImage?.fit}
            title={title}
            description={summary}
          />
        ))}
    </SimpleGrid>
  )
}
