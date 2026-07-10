import { QueryClient, dehydrate } from '@tanstack/react-query'
import type { GetServerSideProps, NextPage } from 'next'

import { getLatestPosts } from '@blog/api'
import { HomePage as HomePageComponent, withErrorComponent } from '@blog/components'
import { getServerTranslations } from '@blog/core/i18n'
import { setCacheControl } from '@blog/utils'
import { getLatestPostsKey } from '@blog/utils/constants'

const HomePage: NextPage = () => {
  return <HomePageComponent />
}

export const getServerSideProps: GetServerSideProps = async ({ locale, res }) => {
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: getLatestPostsKey('HomePage'),
    queryFn: () =>
      getLatestPosts({
        locale: locale as AppLocales,
        limit: 18,
      }),
  })

  // Cache the SSR response at the edge so repeated hits (crawlers, uptime monitors, users)
  // are served by the CDN instead of re-invoking the origin on every request.
  setCacheControl(res)

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
      ...(locale && (await getServerTranslations(locale, ['common', 'homePage']))),
    },
  }
}

export default withErrorComponent(HomePage)
