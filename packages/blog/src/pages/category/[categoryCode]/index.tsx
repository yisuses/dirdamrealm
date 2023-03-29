import { ParsedUrlQuery } from 'querystring'
import * as Sentry from '@sentry/nextjs'
import { QueryClient } from '@tanstack/react-query'
import type { GetServerSideProps } from 'next'

import { getCategories } from '@api'
import { withErrorComponent, WithErrorProps } from '@components'
import { buildCategoryPath, handlePageError, NotFoundError } from '@utils'
import { getCategoryCodeKey } from '@utils/constants'

export interface UrlParams extends ParsedUrlQuery {
  categoryCode: string
}

export const getServerSideProps: GetServerSideProps<Record<string, never> | WithErrorProps, UrlParams> = async ({
  params,
  res,
  locale,
}) => {
  const queryClient = new QueryClient()
  try {
    if (!params?.categoryCode || !/^[A-Z]+$/.test(params.categoryCode)) {
      throw new NotFoundError(`Category code must be uppercase. ${params!.categoryCode} was sent instead.`)
    }

    const categoryCode = params.categoryCode
    const categoriesKey = getCategoryCodeKey(categoryCode)
    queryClient.prefetchQuery(categoriesKey, () => getCategories({ locale: locale as AppLocales, code: categoryCode }))
    const categories = await queryClient.ensureQueryData<Category[]>(categoriesKey)

    if (categories.length !== 1) {
      const errMsg = `Category with code '${params!.categoryCode}' not found, or found multiple`
      Sentry.captureException(errMsg)
      throw new NotFoundError(errMsg)
    }

    const categoryPath = buildCategoryPath(params.categoryCode, categories[0].name)

    return {
      redirect: {
        destination: categoryPath,
        permanent: true,
      },
    }
  } catch (error) {
    return handlePageError(error as Error, res)
  }
}

const Index = () => <div />

export default withErrorComponent(Index)
