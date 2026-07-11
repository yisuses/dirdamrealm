import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { cache } from 'react'
import { ItemList, WebPage } from 'schema-dts'

import { getCategories, getLatestPosts } from '@blog/api'
import { CategoryPage, JsonLd } from '@blog/components'
import { DEFAULT_LOCALE, LOCALES } from '@blog/core/i18n/config'
import { getServerT } from '@blog/core/i18n/server'
import { buildPageMetadata } from '@blog/core/metadata/build-metadata'
import { getQueryClient } from '@blog/core/query/get-query-client'
import { buildCategoryPath, buildPostPath, publicUrl, seoName } from '@blog/utils'
import { getCategoryCodeKey, getLatestPostsKey } from '@blog/utils/constants'

export const revalidate = 3600

interface CategoryPageProps {
  params: Promise<{ lng: AppLocales; categoryCode: string; categoryName: string }>
}

const getCategory = cache(async (lng: AppLocales, code: string) => {
  const categories = await getCategories({ locale: lng, code }).catch(() => [] as Category[])
  return categories.length === 1 ? categories[0] : undefined
})

const localePrefix = (lng: AppLocales) => (lng === DEFAULT_LOCALE ? '' : `/${lng}`)

export async function generateStaticParams() {
  const perLocale = await Promise.all(
    LOCALES.map(async lng => {
      const categories = await getCategories({ locale: lng }).catch(() => [] as Category[])
      return categories.map(category => ({
        lng,
        categoryCode: category.code,
        categoryName: seoName(category.localizedName),
      }))
    }),
  )
  return perLocale.flat()
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { lng, categoryCode } = await params
  if (!/^[A-Z]+$/.test(categoryCode)) return {}

  const [category, { t: tCommon }, { t }] = await Promise.all([
    getCategory(lng, categoryCode),
    getServerT(lng, 'common'),
    getServerT(lng, 'categoryPage'),
  ])
  if (!category) return {}

  return buildPageMetadata({
    lng,
    pageTitle: tCommon('pageTitle'),
    name: t('categoryPage.title', { categoryName: category.localizedName }),
    description: t('categoryPage.description', { categoryName: category.localizedName }),
    path: buildCategoryPath(category.code, category.localizedName),
  })
}

export default async function Page({ params }: CategoryPageProps) {
  const { lng, categoryCode, categoryName } = await params

  if (!/^[A-Z]+$/.test(categoryCode)) notFound()

  const category = await getCategory(lng, categoryCode)
  if (!category) notFound()

  if (categoryName !== seoName(category.localizedName)) {
    redirect(`${localePrefix(lng)}${buildCategoryPath(category.code, category.localizedName)}`)
  }

  const queryClient = getQueryClient()
  queryClient.setQueryData(getCategoryCodeKey(categoryCode), [category])
  const latestPosts = await queryClient.fetchQuery({
    queryKey: getLatestPostsKey(categoryCode),
    queryFn: () => getLatestPosts({ locale: lng, category: categoryCode }),
  })

  const { t } = await getServerT(lng, 'categoryPage')
  const ldJsonPage: WebPage = {
    '@type': 'WebPage',
    headline: t('categoryPage.title', { categoryName: category.localizedName }),
    url: publicUrl(`${localePrefix(lng)}${buildCategoryPath(category.code, category.name)}`),
  }
  const ldJsonItems: ItemList = {
    '@type': 'ItemList',
    itemListElement: (latestPosts || []).map((post, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: publicUrl(`${localePrefix(lng)}${buildPostPath(post.id.toString(), post.title)}`),
    })),
  }

  return (
    <>
      <JsonLd items={[ldJsonPage, ldJsonItems]} />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <CategoryPage />
      </HydrationBoundary>
    </>
  )
}
