import { useTranslation } from 'next-i18next'
import { useQueryClient } from 'react-query'
import { seoName } from 'utils'

export function useGetCategories(): { label: string; url: string }[] {
  const { t } = useTranslation('common')
  const queryClient = useQueryClient()
  const categories = queryClient.getQueryData<CategoryResponse>('categories')
  return (
    categories?.data
      .filter(category => category.attributes.main)
      .map(category => ({
        label: t(`categories.${category.attributes.code}` as const),
        url: `/${seoName(category.attributes.name)}`,
      })) || []
  )
}
