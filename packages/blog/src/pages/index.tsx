import type { GetServerSideProps, NextPage } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import { getLatestPosts } from '@api'
import { withErrorComponent, WithErrorProps, HomePage as HomePageComponent } from '@components'

const HomePage: NextPage<HomePageProps> = ({ latestPosts }) => {
  return <HomePageComponent latestPosts={latestPosts || []} />
}

export const getServerSideProps: GetServerSideProps<HomePageProps | WithErrorProps> = async ({ locale }) => {
  const latestPostsRequest = getLatestPosts({ limit: 9 })

  const [responseLatestPost] = await Promise.all([latestPostsRequest])

  return {
    props: {
      latestPosts: responseLatestPost,
      ...(locale && (await serverSideTranslations(locale, ['common', 'homePage']))),
    },
  }
}

export default withErrorComponent<HomePageProps>(HomePage)

export type HomePageProps = {
  latestPosts?: Post[]
}
