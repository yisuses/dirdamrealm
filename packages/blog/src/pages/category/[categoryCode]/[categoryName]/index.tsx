import { ParsedUrlQuery } from 'querystring'
import type { GetServerSideProps, NextPage } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import { getCategories, getLatestPosts } from '@api'
import { withErrorComponent, WithErrorProps, CategoryPage as CategoryPageComponent } from '@components'
import { buildCategoryPath, handlePageError, NotFoundError, seoName } from '@utils'

const CategoryPage: NextPage<CategoryPageProps> = ({ latestPosts, category }) => {
  return <CategoryPageComponent latestPosts={latestPosts} category={category} />
}

export interface UrlParams extends ParsedUrlQuery {
  categoryCode: string
  categoryName: string
}

export const getServerSideProps: GetServerSideProps<CategoryPageProps | WithErrorProps, UrlParams> = async ({
  params,
  res,
  locale,
  defaultLocale,
}) => {
  let categories: Category[] = []
  try {
    if (!params?.categoryCode || !/^[A-Z]+$/.test(params.categoryCode)) {
      throw new NotFoundError(`Category code must be uppercase. ${params!.categoryCode} was sent instead.`)
    }

    categories = await getCategories({ locale: locale as AppLocales, code: params.categoryCode })

    if (categories.length !== 1) {
      throw new NotFoundError(`Category with code '${params!.categoryCode}' not found, or found multiple`)
    }

    const seoFriendlyName = seoName(categories[0].localizedName)
    const categoryNameNotCorrect = params?.categoryName !== seoFriendlyName

    if (categoryNameNotCorrect) {
      const categoryPath = buildCategoryPath(params.categoryCode, categories[0].localizedName)

      return {
        redirect: {
          destination: `${locale !== defaultLocale ? `/${locale}` : ''}${categoryPath}`,
          permanent: true,
        },
      }
    }
  } catch (error) {
    return handlePageError(error as Error, res)
  }

  const latestPostsRequest = getLatestPosts({ locale: locale as AppLocales, category: params.categoryCode })

  const [responseLatestPost] = await Promise.all([latestPostsRequest])

  return {
    props: {
      category: categories[0],
      latestPosts: responseLatestPost || [],
      ...(locale && (await serverSideTranslations(locale, ['common', 'categoryPage']))),
    },
  }
}

export default withErrorComponent<CategoryPageProps>(CategoryPage)

export type CategoryPageProps = {
  category: Category
  latestPosts: Post[]
}
