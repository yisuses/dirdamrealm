import parseISO from 'date-fns/parseISO'
import { useTranslation } from 'next-i18next'

import { Metadata, HeaderImage } from '@components/common'
import { useGetCategories } from '@hooks'
import { HomeLatestPosts } from '../HomeLatestPosts'

export interface HomePageProps {
  latestPosts: Post[]
}

export function HomePage({ latestPosts }: HomePageProps) {
  const { t } = useTranslation('homePage')

  const categories = useGetCategories()
  const lastPost = latestPosts?.[0]

  //TODO ldjson

  return (
    <>
      <Metadata name={t('homePage.title')} description={t('homePage.description')} />
      {lastPost ? (
        <HeaderImage
          imgSrc={lastPost.coverImage?.url || lastPost.imgUrl || 'https://picsum.photos/1440/600'}
          date={parseISO(lastPost.publishedAt)}
          categories={lastPost.categories || []}
          title={lastPost.title}
          subtitle={lastPost.summary}
        />
      ) : (
        <div>{t('homePage.noPublishedArticles')}</div>
      )}
      <HomeLatestPosts title={t('latestPosts.title')} categories={categories} posts={latestPosts} />
    </>
  )
}
