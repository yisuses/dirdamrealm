import { useTranslation } from 'next-i18next'

import { HeaderImage, Metadata } from '@components/common'
import { CategoryLatestPosts } from '../CategoryLatestPosts'

export interface CategoryPageProps {
  category: Category
  latestPosts: Post[]
}

export function CategoryPage({ latestPosts, category }: CategoryPageProps) {
  const { t } = useTranslation('categoryPage')
  const lastPost = latestPosts?.[0]
  //TODO ldjson

  return (
    <>
      <Metadata
        name={t('categoryPage.title', { categoryName: category.localizedName })}
        description={t('categoryPage.description', { categoryName: category.localizedName })}
      />
      {lastPost ? <HeaderImage post={lastPost} showPostInfo /> : <div>{t('categoryPage.noPublishedArticles')}</div>}
      <CategoryLatestPosts
        posts={latestPosts.slice(1)}
        title={t('latestPosts.title', { categoryName: category.localizedName })}
      />
    </>
  )
}
