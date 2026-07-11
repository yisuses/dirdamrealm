import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { WebPage } from 'schema-dts'

import { getLatestPosts } from '@blog/api'
import { HomePage, JsonLd } from '@blog/components'
import { DEFAULT_LOCALE } from '@blog/core/i18n/config'
import { getServerT } from '@blog/core/i18n/server'
import { buildPageMetadata } from '@blog/core/metadata/build-metadata'
import { getQueryClient } from '@blog/core/query/get-query-client'
import { getLatestPostsKey } from '@blog/utils/constants'
import { publicUrl } from '@blog/utils/generateUrl/generateUrl'

// Published content changes rarely; regenerate at most hourly (ISR).
export const revalidate = 3600

interface PageProps {
  params: Promise<{ lng: AppLocales }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lng } = await params
  const [{ t: tCommon }, { t }] = await Promise.all([getServerT(lng, 'common'), getServerT(lng, 'homePage')])
  return buildPageMetadata({
    lng,
    pageTitle: tCommon('pageTitle'),
    name: t('homePage.title'),
    description: t('homePage.description'),
    path: '',
  })
}

export default async function Page({ params }: PageProps) {
  const { lng } = await params
  const { t } = await getServerT(lng, 'homePage')

  const queryClient = getQueryClient()
  await queryClient.prefetchQuery({
    queryKey: getLatestPostsKey('HomePage'),
    queryFn: () => getLatestPosts({ locale: lng, limit: 18 }),
  })

  const ldJson: WebPage = {
    '@type': 'WebPage',
    headline: t('homePage.title'),
    url: publicUrl(lng === DEFAULT_LOCALE ? '' : `/${lng}`),
  }

  return (
    <>
      <JsonLd items={[ldJson]} />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <HomePage />
      </HydrationBoundary>
    </>
  )
}
