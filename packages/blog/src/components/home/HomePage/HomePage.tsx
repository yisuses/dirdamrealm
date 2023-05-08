import { useTranslation } from 'next-i18next'
import { WebPage } from 'schema-dts'

import { Metadata, HeaderImage } from '@components/common'
import { useGetData } from '@hooks'
import { publicUrl } from '@utils'
import { QUERY_CATEGORIES, getLatestPostsKey } from '@utils/constants'
import { HomeLatestPosts } from '../HomeLatestPosts'

export function HomePage() {
  const { t } = useTranslation('homePage')

  const ldJson: WebPage = {
    '@type': 'WebPage',
    headline: t('homePage.title'),
    url: publicUrl(''),
  }

  const latestPosts = useGetData<Post[]>(getLatestPostsKey('HomePage'))
  const categories = useGetData<Category[]>(QUERY_CATEGORIES, [])
  const headerPost = latestPosts?.[0]
  const totalLatestPosts = latestPosts?.slice(0, 9) ?? []

  return (
    <>
      <Metadata name={t('homePage.title')} description={t('homePage.description')} ldJson={[ldJson]} />
      {headerPost ? <HeaderImage post={headerPost} showPostInfo /> : <div>{t('homePage.noPublishedArticles')}</div>}

      {totalLatestPosts.length > 0 && (
        <HomeLatestPosts title={t('latestPosts.title')} categories={categories} posts={totalLatestPosts} />
      )}
    </>
  )
}
