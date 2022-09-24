import { useTranslation } from 'next-i18next'
import { WebPage } from 'schema-dts'

import { Metadata, HeaderImage } from '@components/common'
import { useGetCategories } from '@hooks'
import { publicUrl } from '@utils'
import { HomeLatestPosts } from '../HomeLatestPosts'
export interface HomePageProps {
  latestPosts: Post[]
}

export function HomePage({ latestPosts }: HomePageProps) {
  const { t } = useTranslation('homePage')

  const categories = useGetCategories()
  const lastPost = latestPosts?.[0]

  const ldJson: WebPage = {
    '@type': 'WebPage',
    headline: t('homePage.title'),
    url: publicUrl(''),
  }

  return (
    <>
      <Metadata name={t('homePage.title')} description={t('homePage.description')} ldJson={[ldJson]} />
      {lastPost ? <HeaderImage post={lastPost} showPostInfo /> : <div>{t('homePage.noPublishedArticles')}</div>}

      <HomeLatestPosts title={t('latestPosts.title')} categories={categories} posts={latestPosts.slice(0, 9)} />
    </>
  )
}
