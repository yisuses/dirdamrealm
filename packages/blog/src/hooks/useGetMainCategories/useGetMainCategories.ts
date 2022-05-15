import { useRouter } from 'next/router'
import { useQueryClient } from 'react-query'

import { seoName } from '@utils'

export function useGetMainCategories() {
  const { locale } = useRouter()
  const queryClient = useQueryClient()
  const categories = queryClient.getQueryData<Category[]>('categories')

  return (
    categories
      ?.filter(category => category.main)
      .map(category => ({
        label: (locale && category.locale?.[locale as AppLocales]) || category.name,
        url: `/${seoName(category.name)}`,
      })) || []
  )
}
