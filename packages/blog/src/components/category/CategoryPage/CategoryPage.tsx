'use client'

import { useParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'

import { HeaderImage } from '@blog/components/common'
import { useGetData } from '@blog/hooks'
import { getCategoryCodeKey, getLatestPostsKey } from '@blog/utils/constants'

import { CategoryLatestPosts } from '../CategoryLatestPosts'

export function CategoryPage() {
  const { t } = useTranslation('categoryPage')
  const { categoryCode } = useParams<{ categoryCode: string }>()

  const latestPosts = useGetData<Post[]>(getLatestPostsKey(String(categoryCode)), [])
  const lastPost = latestPosts?.[0]
  const categories = useGetData<Category[]>(getCategoryCodeKey(categoryCode as string))

  if (!categories) {
    return null
  }

  const category = categories[0]

  return (
    <>
      {lastPost ? <HeaderImage post={lastPost} showPostInfo /> : <div>{t('categoryPage.noPublishedArticles')}</div>}
      <CategoryLatestPosts
        posts={latestPosts.slice(1)}
        title={t('latestPosts.title', { categoryName: category.localizedName })}
      />
    </>
  )
}
