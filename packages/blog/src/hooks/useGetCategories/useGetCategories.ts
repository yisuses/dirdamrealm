import { useQueryClient } from '@tanstack/react-query'

export function useGetCategories() {
  const queryClient = useQueryClient()
  const categories = queryClient.getQueryData<Category[]>(['categories'])

  return categories || []
}
