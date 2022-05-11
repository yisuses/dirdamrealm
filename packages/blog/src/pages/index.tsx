import type { GetServerSideProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { getLastPosts } from 'api'
import {
  withErrorComponent,
  WithErrorProps,
  HomePage as HomePageComponent,
  HomePageProps as HomePageComponentProps,
} from '../components'

const HomePage = ({ lastPosts }: HomePageProps) => {
  const lastPost = lastPosts?.[0]
  const headerPost: HomePageComponentProps['headerPost'] = lastPost
    ? {
        imgUrl: lastPost.coverImage?.url || lastPost.imgUrl,
        date: lastPost.publishedAt,
        title: lastPost.title,
        subtitle: lastPost.summary,
        categories: lastPost.categories.map(category => category.code),
      }
    : undefined
  return <HomePageComponent headerPost={headerPost} lastEntries={lastPosts?.slice(1) || []} />
}

export const getServerSideProps: GetServerSideProps<HomePageProps | WithErrorProps> = async ({ locale }) => {
  const lastPostsRequest = getLastPosts(locale as AppLocales)

  const [responseLastPost] = await Promise.all([lastPostsRequest])

  return {
    props: {
      lastPosts: responseLastPost,
      ...(locale && (await serverSideTranslations(locale, ['common', 'homePage']))),
    },
  }
}

export default withErrorComponent<HomePageProps>(HomePage)

export type HomePageProps = {
  lastPosts?: Post[]
}
