import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { ItemList, WebPage } from 'schema-dts'

import { getCategories } from '@blog/api/category'
import { getAllPosts } from '@blog/api/post'
import { ArchivePage, JsonLd } from '@blog/components'
import { DEFAULT_LOCALE } from '@blog/core/i18n/config'
import { getServerT } from '@blog/core/i18n/server'
import { buildPageMetadata } from '@blog/core/metadata/build-metadata'
import { getQueryClient } from '@blog/core/query/get-query-client'
import { buildPostPath, publicUrl } from '@blog/utils'
import { ARCHIVE_POSTS_KEY, getCategoriesKey } from '@blog/utils/constants'

export const revalidate = 3600

interface ArchiveProps {
  params: Promise<{ lng: AppLocales }>
}

const localePrefix = (lng: AppLocales) => (lng === DEFAULT_LOCALE ? '' : `/${lng}`)

export async function generateMetadata({ params }: ArchiveProps): Promise<Metadata> {
  const { lng } = await params
  const [{ t: tCommon }, { t }] = await Promise.all([getServerT(lng, 'common'), getServerT(lng, 'archivePage')])
  return buildPageMetadata({
    lng,
    pageTitle: tCommon('pageTitle'),
    name: t('archivePage.title'),
    description: t('archivePage.description'),
    path: '/archive/',
  })
}

export default async function Page({ params }: ArchiveProps) {
  const { lng } = await params

  const queryClient = getQueryClient()
  const [posts] = await Promise.all([
    queryClient.fetchQuery({ queryKey: ARCHIVE_POSTS_KEY, queryFn: () => getAllPosts({ locale: lng }) }),
    queryClient.prefetchQuery({
      queryKey: getCategoriesKey(lng),
      queryFn: () => getCategories({ locale: lng }),
    }),
  ])

  const { t } = await getServerT(lng, 'archivePage')
  const ldJsonPage: WebPage = {
    '@type': 'WebPage',
    headline: t('archivePage.title'),
    url: publicUrl(`${localePrefix(lng)}/archive`),
  }
  const ldJsonItems: ItemList = {
    '@type': 'ItemList',
    itemListElement: (posts || []).map((post, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: publicUrl(`${localePrefix(lng)}${buildPostPath(post.id, post.title)}`),
    })),
  }

  return (
    <>
      <JsonLd items={[ldJsonPage, ldJsonItems]} />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ArchivePage />
      </HydrationBoundary>
    </>
  )
}
