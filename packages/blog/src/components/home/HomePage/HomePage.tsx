'use client'

import { useTranslation } from 'react-i18next'

import { HeaderImage } from '@blog/components/common'
import { useGetData, useLocale } from '@blog/hooks'
import { getCategoriesKey, getLatestPostsKey } from '@blog/utils/constants'

import { HomeLatestPosts } from '../HomeLatestPosts'

export function HomePage() {
  const { t } = useTranslation('homePage')
  const locale = useLocale()

  const latestPosts = useGetData<Post[]>(getLatestPostsKey('HomePage'))
  const categories = useGetData<Category[]>(getCategoriesKey(locale), [])
  const headerPost = latestPosts?.[0]
  const totalLatestPosts = latestPosts?.slice(0, 9) ?? []

  return (
    <>
      {headerPost ? <HeaderImage post={headerPost} showPostInfo /> : <div>{t('homePage.noPublishedArticles')}</div>}

      {totalLatestPosts.length > 0 && (
        <HomeLatestPosts title={t('latestPosts.title')} categories={categories} posts={totalLatestPosts} />
      )}
    </>
  )
}
