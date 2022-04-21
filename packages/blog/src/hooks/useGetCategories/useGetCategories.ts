import { useTranslation } from 'next-i18next'
import { useQuery } from 'react-query'

import { getCategories } from 'api'
import { seoName } from 'utils'

export function useGetCategories(): { label: string; url: string }[] {
  const { t } = useTranslation('common')
  const { data: categoriesData } = useQuery('categories', getCategories)

  return (
    categoriesData?.data
      .filter(({ attributes }) => attributes.main)
      .map(({ attributes }) => ({
        label: t(`categories.${attributes.code}` as const),
        url: `/${seoName(attributes.name)}`,
      })) || []
  )
}
