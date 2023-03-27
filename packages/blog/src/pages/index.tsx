import { dehydrate, QueryClient } from '@tanstack/react-query'
import type { GetServerSideProps, NextPage } from 'next'

import { getLatestPosts } from '@api'
import { withErrorComponent, WithErrorProps, HomePage as HomePageComponent } from '@components'
import { getServerTranslations } from '@core/i18n'

const HomePage: NextPage<HomePageProps> = ({ latestPosts }) => {
  return <HomePageComponent latestPosts={latestPosts || []} />
}

export const getServerSideProps: GetServerSideProps<HomePageProps | WithErrorProps> = async ({ locale }) => {
  const queryClient = new QueryClient()

  queryClient.prefetchQuery(['latestPostsHomePage'], () =>
    getLatestPosts({
      locale: locale as AppLocales,
      limit: 18,
    }),
  )
  const latestPosts = await queryClient.ensureQueryData<Post[] | undefined>(['latestPostsHomePage'])

  return {
    props: {
      latestPosts,
      dehydratedState: dehydrate(queryClient),
      ...(locale && (await getServerTranslations(locale, ['common', 'homePage']))),
    },
  }
}

export default withErrorComponent<HomePageProps>(HomePage)

export type HomePageProps = {
  latestPosts?: Post[]
}
