import type { GetServerSideProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import { getLatestPosts } from '@api'
import { withErrorComponent, WithErrorProps, HomePage as HomePageComponent } from '@components'

const HomePage = ({ latestPosts }: HomePageProps) => {
  return <HomePageComponent latestPosts={latestPosts || []} />
}

export const getServerSideProps: GetServerSideProps<HomePageProps | WithErrorProps> = async ({ locale }) => {
  const latestPostsRequest = getLatestPosts({ lang: locale as AppLocales })

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
