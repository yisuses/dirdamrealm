import { SimpleGrid } from '@chakra-ui/layout'
import { format, parseISO } from 'date-fns'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'

import { PostCard } from '@components/common'
import { getImageUrlFromMedia } from '@utils'

interface PostGridProps {
  posts: Post[]
}

export function PostGrid({ posts }: PostGridProps) {
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
      {posts.map(({ id, categories, publishedAt, coverImage, title, summary, imgUrl, locale: postLocale }) => (
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
          date={format(parseISO(publishedAt), 'dd.MM.yyyy')}
          imageUrl={getImageUrlFromMedia({ media: coverImage, format: 'small', fallback: imgUrl })}
          title={title}
          description={summary}
        />
      ))}
    </SimpleGrid>
  )
}
