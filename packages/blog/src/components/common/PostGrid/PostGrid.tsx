import { SimpleGrid } from '@chakra-ui/layout'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'

import { PostCard } from '@blog/components/common'
import { getImageUrlFromMedia } from '@blog/utils'

interface PostGridProps {
  posts: Post[]
  limit?: number
}

export function PostGrid({ posts, limit }: PostGridProps) {
  const { locale } = useRouter()
  const { t } = useTranslation('common')

  return (
    <SimpleGrid
      gridTemplateColumns={{
        base: 'repeat(auto-fill, minmax(100%, 1fr))',
        md: 'repeat(auto-fill, minmax(280px, 1fr))',
      }}
      spacing={8}
      mt={8}
      justifyItems="center"
    >
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
            imageUrl={getImageUrlFromMedia({ media: coverImage, format: 'small', fallback: imgUrl })}
            title={title}
            description={summary}
          />
        ))}
    </SimpleGrid>
  )
}
