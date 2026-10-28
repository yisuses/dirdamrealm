import { notFound } from 'next/navigation'

import { CategoryForm } from '@blog/components/admin/categories/CategoryForm'
import { isUuid } from '@blog/core/validation/uuid'
import { getCategoryForAdmin } from '@blog/db/queries/admin/categories'

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const category = isUuid(id) ? await getCategoryForAdmin(id) : undefined
  if (!category) {
    notFound()
  }
  return <CategoryForm category={category} />
}
