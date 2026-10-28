import { CategoryList } from '@blog/components/admin/categories/CategoryList'
import { listCategoriesForAdmin } from '@blog/db/queries/admin/categories'

export default async function CategoriesPage() {
  return <CategoryList categories={await listCategoriesForAdmin()} />
}
