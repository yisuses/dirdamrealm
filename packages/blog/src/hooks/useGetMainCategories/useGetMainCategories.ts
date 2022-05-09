import { useTranslation } from 'next-i18next'
import { useQueryClient } from 'react-query'

import { seoName } from '@/utils'

export function useGetMainCategories(): { label: string; url: string }[] {
  const { t } = useTranslation('common')
  const queryClient = useQueryClient()
  const categories = queryClient.getQueryData<Category[]>('categories')

  return (
    categories
      ?.filter(category => category.main)
      .map(category => ({
        label: t(`categories.${category.code}` as const),
        url: `/${seoName(category.name)}`,
      })) || []
  )
}
