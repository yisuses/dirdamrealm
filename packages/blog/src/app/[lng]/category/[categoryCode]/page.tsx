import * as sentry from '@sentry/nextjs'
import { notFound, redirect } from 'next/navigation'

import { getCategories } from '@blog/api'
import { DEFAULT_LOCALE } from '@blog/core/i18n/config'
import { buildCategoryPath } from '@blog/utils'

interface Props {
  params: Promise<{ lng: AppLocales; categoryCode: string }>
}

// /category/:code → redirect to the canonical /category/:code/:slug url.
export default async function Page({ params }: Props) {
  const { lng, categoryCode } = await params
  if (!/^[A-Z]+$/.test(categoryCode)) notFound()

  const categories = await getCategories({ locale: lng, code: categoryCode }).catch(error => {
    sentry.captureException(error)
    return [] as Category[]
  })

  if (categories.length !== 1) {
    sentry.captureException(`Category with code '${categoryCode}' not found, or found multiple`)
    notFound()
  }

  const prefix = lng === DEFAULT_LOCALE ? '' : `/${lng}`
  redirect(`${prefix}${buildCategoryPath(categoryCode, categories[0].localizedName)}`)
}
