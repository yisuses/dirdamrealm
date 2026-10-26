import { requireAuth } from '@blog/core/api/parseRequest'
import { revalidatePostPages } from '@blog/core/cache/revalidatePostPages'
import { deleteComment } from '@blog/db/queries/admin/comments'

interface Context {
  params: Promise<{ id: string }>
}

/** Deletes a visitor's comment and refreshes the pages that showed it. */
export async function DELETE(_request: Request, { params }: Context) {
  const authResult = await requireAuth()
  if (!authResult.ok) {
    return authResult.response
  }
  const { id } = await params
  const pages = /^\d{1,9}$/.test(id) ? await deleteComment(Number(id)) : undefined
  if (!pages) {
    return Response.json({ error: 'El comentario no existe' }, { status: 404 })
  }
  revalidatePostPages(pages)
  return new Response(null, { status: 204 })
}
