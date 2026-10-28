import { parseAuthRequest } from '@blog/core/api/parseRequest'
import { revalidatePublicContent } from '@blog/core/cache/revalidatePublicContent'
import { categorySchema } from '@blog/core/validation/category'
import { createCategory, isCategoryCodeTaken } from '@blog/db/queries/admin/categories'

export async function POST(request: Request) {
  const parsed = await parseAuthRequest(request, categorySchema)
  if (!parsed.ok) {
    return parsed.response
  }
  if (await isCategoryCodeTaken(parsed.data.code)) {
    return Response.json({ error: 'Ya hay una categoría con ese código' }, { status: 409 })
  }
  const id = await createCategory(parsed.data)
  revalidatePublicContent()
  return Response.json({ id }, { status: 201 })
}
