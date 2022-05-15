import parseISO from 'date-fns/parseISO'
import { useTranslation } from 'next-i18next'

import { Metadata } from '@/components/common'
import { HeaderImage } from '../HeaderImage'
import { LatestPosts } from '../LatestPosts'

export type HeaderPostProps = {
  imgUrl: string
  date: string
  title: string
  subtitle: string
  categories: Category[]
}

export interface HomePageProps {
  headerPost?: HeaderPostProps
  latestPosts: Post[]
  categories: Category[]
}
export function HomePage({ headerPost, latestPosts, categories }: HomePageProps) {
  const { t } = useTranslation('homePage')
  return (
    <>
      <Metadata name={t('homePage.title')} description={t('homePage.description')} />
      {headerPost ? (
        <HeaderImage
          imgSrc={headerPost.imgUrl}
          date={parseISO(headerPost.date)}
          categories={headerPost.categories}
          title={headerPost.title}
          subtitle={headerPost.subtitle}
        />
      ) : (
        <div>{t('homePage.noPublishedArticles')}</div>
      )}
      <LatestPosts categories={categories} posts={latestPosts} />
    </>
  )
}
