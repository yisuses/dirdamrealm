import { dehydrate, QueryClient } from '@tanstack/react-query'
import type { GetServerSideProps, NextPage } from 'next'

import { getLatestPosts } from '@api'
import { withErrorComponent, HomePage as HomePageComponent } from '@components'
import { getServerTranslations } from '@core/i18n'
import { QUERY_LATEST_POSTS } from '@utils/constants'

const HomePage: NextPage = () => {
  return <HomePageComponent />
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery(QUERY_LATEST_POSTS, () =>
    getLatestPosts({
      locale: locale as AppLocales,
      limit: 18,
    }),
  )

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
      ...(locale && (await getServerTranslations(locale, ['common', 'homePage']))),
    },
  }
}

export default withErrorComponent(HomePage)
