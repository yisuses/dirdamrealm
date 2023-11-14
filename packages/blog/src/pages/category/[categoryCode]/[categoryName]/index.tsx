import { QueryClient, dehydrate } from '@tanstack/react-query'
import type { GetServerSideProps, NextPage } from 'next'
import { ParsedUrlQuery } from 'querystring'

import { getCategories, getLatestPosts } from '@blog/api'
import { CategoryPage as CategoryPageComponent, WithErrorProps, withErrorComponent } from '@blog/components'
import { getServerTranslations } from '@blog/core/i18n'
import { NotFoundError, buildCategoryPath, handlePageError, seoName } from '@blog/utils'
import { getCategoryCodeKey, getLatestPostsKey } from '@blog/utils/constants'

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
    queryClient.prefetchQuery({
      queryKey: categoriesKey,
      queryFn: () => getCategories({ locale: locale as AppLocales, code: categoryCode }),
    })
    categories = await queryClient.ensureQueryData({ queryKey: categoriesKey })

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
  await queryClient.prefetchQuery({
    queryKey: latestPostsCategoryKey,
    queryFn: () =>
      getLatestPosts({
        locale: locale as AppLocales,
        category: params.categoryCode,
      }),
  })

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
      ...(locale && (await getServerTranslations(locale, ['common', 'categoryPage']))),
    },
  }
}

export default withErrorComponent(CategoryPage)
