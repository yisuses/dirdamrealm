import type { GetServerSideProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { getLastPost } from 'api'
import {
  withErrorComponent,
  WithErrorProps,
  HomePage as HomePageComponent,
  HomePageProps as HomePageComponentProps,
} from '../components'

const HomePage = ({ lastPost }: HomePageProps) => {
  const headerPost: HomePageComponentProps['headerPost'] = lastPost
    ? {
        imgUrl: lastPost.imgUrl,
        date: lastPost.publishedAt,
        title: lastPost.title,
        subtitle: lastPost.summary,
        categories: lastPost.categories.map(category => category.code),
      }
    : undefined
  return <HomePageComponent headerPost={headerPost} />
}

export const getServerSideProps: GetServerSideProps<HomePageProps | WithErrorProps> = async ({ locale }) => {
  const lastPostRequest = getLastPost(locale as AppLocales)

  const [responseLastPost] = await Promise.all([lastPostRequest])

  return {
    props: {
      lastPost: responseLastPost,
      ...(locale && (await serverSideTranslations(locale, ['common', 'homePage']))),
    },
  }
}

export default withErrorComponent<HomePageProps>(HomePage)

export type HomePageProps = {
  lastPost?: Post
}
