import type { GetServerSideProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { getLastPosts, getCategories } from 'api'
import {
  withErrorComponent,
  WithErrorProps,
  HomePage as HomePageComponent,
  HomePageProps as HomePageComponentProps,
} from '../components'

const HomePage = ({ lastPosts, categories }: HomePageProps) => {
  const lastPost = lastPosts?.[0]
  const headerPost: HomePageComponentProps['headerPost'] = lastPost
    ? {
        imgUrl: lastPost.coverImage?.url || lastPost.imgUrl || 'https://picsum.photos/1440/600',
        date: lastPost.publishedAt,
        title: lastPost.title,
        subtitle: lastPost.summary,
        categories: lastPost.categories,
      }
    : undefined
  return (
    <HomePageComponent categories={categories || []} headerPost={headerPost} lastEntries={lastPosts?.slice(1) || []} />
  )
}

export const getServerSideProps: GetServerSideProps<HomePageProps | WithErrorProps> = async ({ locale }) => {
  const lastPostsRequest = getLastPosts(locale as AppLocales)
  const categoriesRequest = getCategories()

  const [responseLastPost, categoriesResponse] = await Promise.all([lastPostsRequest, categoriesRequest])

  return {
    props: {
      lastPosts: responseLastPost,
      categories: categoriesResponse,
      ...(locale && (await serverSideTranslations(locale, ['common', 'homePage']))),
    },
  }
}

export default withErrorComponent<HomePageProps>(HomePage)

export type HomePageProps = {
  lastPosts?: Post[]
  categories?: Category[]
}
