import { useGetCategories } from '@hooks/useGetCategories'

export function useGetMainCategories() {
  const categories = useGetCategories()

  return categories.filter(category => category.main) || []
}
