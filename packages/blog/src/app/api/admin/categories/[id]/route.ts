import { parseAuthRequest, requireAuth } from '@blog/core/api/parseRequest'
import { revalidatePublicContent } from '@blog/core/cache/revalidatePublicContent'
import { categorySchema } from '@blog/core/validation/category'
import { isUuid } from '@blog/core/validation/uuid'
import {
  deleteCategory,
  getCategoryForAdmin,
  isCategoryCodeTaken,
  updateCategory,
} from '@blog/db/queries/admin/categories'

interface Context {
  params: Promise<{ id: string }>
}

const notFound = () => Response.json({ error: 'La categoría no existe' }, { status: 404 })

export async function PUT(request: Request, { params }: Context) {
  const parsed = await parseAuthRequest(request, categorySchema)
  if (!parsed.ok) {
    return parsed.response
  }
  const { id } = await params
  if (!isUuid(id)) {
    return notFound()
  }
  if (await isCategoryCodeTaken(parsed.data.code, id)) {
    return Response.json({ error: 'Ya hay una categoría con ese código' }, { status: 409 })
  }
  if (!(await updateCategory(id, parsed.data))) {
    return notFound()
  }
  revalidatePublicContent()
  return Response.json({ id })
}

/** A category still on posts is only deleted with `?confirm=true`, after the panel warned about it. */
export async function DELETE(request: Request, { params }: Context) {
  const authResult = await requireAuth()
  if (!authResult.ok) {
    return authResult.response
  }
  const { id } = await params
  const category = isUuid(id) ? await getCategoryForAdmin(id) : undefined
  if (!category) {
    return notFound()
  }
  const confirmed = new URL(request.url).searchParams.get('confirm') === 'true'
  if (category.posts > 0 && !confirmed) {
    return Response.json({ error: 'La categoría tiene entradas', posts: category.posts }, { status: 409 })
  }
  await deleteCategory(id)
  revalidatePublicContent()
  return new Response(null, { status: 204 })
}
