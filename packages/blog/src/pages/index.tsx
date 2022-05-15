import type { GetServerSideProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { getLatestPosts, getCategories } from 'api'
import {
  withErrorComponent,
  WithErrorProps,
  HomePage as HomePageComponent,
  HomePageProps as HomePageComponentProps,
} from '../components'

const HomePage = ({ latestPosts, categories }: HomePageProps) => {
  const lastPost = latestPosts?.[0]
  const headerPost: HomePageComponentProps['headerPost'] = lastPost
    ? {
        imgUrl: lastPost.coverImage?.url || lastPost.imgUrl || 'https://picsum.photos/1440/600',
        date: lastPost.publishedAt,
        title: lastPost.title,
        subtitle: lastPost.summary,
        categories: lastPost.categories,
      }
    : undefined
  return <HomePageComponent categories={categories || []} headerPost={headerPost} latestPosts={latestPosts || []} />
}

export const getServerSideProps: GetServerSideProps<HomePageProps | WithErrorProps> = async ({ locale }) => {
  const latestPostsRequest = getLatestPosts({ lang: locale as AppLocales })
  const categoriesRequest = getCategories(locale as AppLocales)

  const [responseLatestPost, categoriesResponse] = await Promise.all([latestPostsRequest, categoriesRequest])

  return {
    props: {
      latestPosts: responseLatestPost,
      categories: categoriesResponse,
      ...(locale && (await serverSideTranslations(locale, ['common', 'homePage']))),
    },
  }
}

export default withErrorComponent<HomePageProps>(HomePage)

export type HomePageProps = {
  latestPosts?: Post[]
  categories?: Category[]
}
