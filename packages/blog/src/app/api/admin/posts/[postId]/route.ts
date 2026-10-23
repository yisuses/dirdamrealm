import { requireAuth } from '@blog/core/api/parseRequest'
import { revalidatePublicContent } from '@blog/core/cache/revalidatePublicContent'
import { isUuid } from '@blog/core/validation/uuid'
import { deletePost } from '@blog/db/queries/admin/posts'

interface Context {
  params: Promise<{ postId: string }>
}

/** Deletes the post in both languages, taking it off the site. */
export async function DELETE(_request: Request, { params }: Context) {
  const authResult = await requireAuth()
  if (!authResult.ok) {
    return authResult.response
  }
  const { postId } = await params
  if (!isUuid(postId) || !(await deletePost(postId))) {
    return Response.json({ error: 'La entrada no existe' }, { status: 404 })
  }
  revalidatePublicContent()
  return new Response(null, { status: 204 })
}
