import { ParsedUrlQuery } from 'querystring'
import { dehydrate, QueryClient } from '@tanstack/react-query'
import type { GetServerSideProps, NextPage } from 'next'

import { getCategories, getLatestPosts } from '@api'
import { withErrorComponent, WithErrorProps, CategoryPage as CategoryPageComponent } from '@components'
import { getServerTranslations } from '@core/i18n'
import { buildCategoryPath, handlePageError, NotFoundError, seoName } from '@utils'
import { getCategoryCodeKey, getLatestPostsKey } from '@utils/constants'

const CategoryPage: NextPage = () => {
  return <CategoryPageComponent />
}

export interface UrlParams extends ParsedUrlQuery {
  categoryCode: string
  categoryName: string
}

export const getServerSideProps: GetServerSideProps<Record<string, unknown> | WithErrorProps, UrlParams> = async ({
  params,
  res,
  locale,
  defaultLocale,
}) => {
  let categories: Category[] = []
  const queryClient = new QueryClient()
  try {
    if (!params?.categoryCode || !/^[A-Z]+$/.test(params.categoryCode)) {
      throw new NotFoundError(`Category code must be uppercase. ${params!.categoryCode} was sent instead.`)
    }

    const categoryCode = params.categoryCode
    const categoriesKey = getCategoryCodeKey(categoryCode)
    queryClient.prefetchQuery(categoriesKey, () => getCategories({ locale: locale as AppLocales, code: categoryCode }))
    categories = await queryClient.ensureQueryData(categoriesKey)

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

  const latestPostsCategoryKey = getLatestPostsKey(params.categoryCode)
  await queryClient.prefetchQuery(latestPostsCategoryKey, () =>
    getLatestPosts({
      locale: locale as AppLocales,
      category: params.categoryCode,
    }),
  )

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
      ...(locale && (await getServerTranslations(locale, ['common', 'categoryPage']))),
    },
  }
}

export default withErrorComponent(CategoryPage)
