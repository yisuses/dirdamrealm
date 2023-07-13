import { QueryClient, dehydrate } from '@tanstack/react-query'
import type { GetServerSideProps, NextPage } from 'next'

import { getLatestPosts } from '@blog/api'
import { HomePage as HomePageComponent, withErrorComponent } from '@blog/components'
import { getServerTranslations } from '@blog/core/i18n'
import { getLatestPostsKey } from '@blog/utils/constants'

const HomePage: NextPage = () => {
  return <HomePageComponent />
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery(getLatestPostsKey('HomePage'), () =>
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
