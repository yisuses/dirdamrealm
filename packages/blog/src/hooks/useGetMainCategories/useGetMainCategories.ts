import { useQueryClient } from 'react-query'

import { seoName } from '@utils'

export function useGetMainCategories() {
  const queryClient = useQueryClient()
  const categories = queryClient.getQueryData<Category[]>('categories')

  return (
    categories
      ?.filter(category => category.main)
      .map(category => ({
        label: category.name,
        url: `/${seoName(category.name)}`,
      })) || []
  )
}
