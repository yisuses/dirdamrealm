import { useTranslation } from 'next-i18next'
import { ItemList, WebPage } from 'schema-dts'

import { HeaderImage, Metadata } from '@components/common'
import { useGetLocalePublicUrl } from '@hooks'
import { buildCategoryPath, buildPostPath } from '@utils'
import { CategoryLatestPosts } from '../CategoryLatestPosts'

export interface CategoryPageProps {
  category: Category
  latestPosts: Post[]
}

export function CategoryPage({ latestPosts, category }: CategoryPageProps) {
  const { t } = useTranslation('categoryPage')
  const generateLocalePublicUrl = useGetLocalePublicUrl()
  const lastPost = latestPosts?.[0]

  const ldJsonPage: WebPage = {
    '@type': 'WebPage',
    headline: t('categoryPage.title', { categoryName: category.localizedName }),
    url: generateLocalePublicUrl(buildCategoryPath(category.code, category.name)),
  }

  const ldJsonItems: ItemList = {
    '@type': 'ItemList',
    itemListElement: latestPosts.map((post, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: generateLocalePublicUrl(buildPostPath(post.id.toString(), post.title)),
    })),
  }

  return (
    <>
      <Metadata
        name={t('categoryPage.title', { categoryName: category.localizedName })}
        description={t('categoryPage.description', { categoryName: category.localizedName })}
        ldJson={[ldJsonPage, ldJsonItems]}
      />
      {lastPost ? <HeaderImage post={lastPost} showPostInfo /> : <div>{t('categoryPage.noPublishedArticles')}</div>}
      <CategoryLatestPosts
        posts={latestPosts.slice(1)}
        title={t('latestPosts.title', { categoryName: category.localizedName })}
      />
    </>
  )
}
