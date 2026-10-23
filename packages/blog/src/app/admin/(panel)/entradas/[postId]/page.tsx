import { notFound, redirect } from 'next/navigation'

import { isUuid } from '@blog/core/validation/uuid'
import { getPostForEditor } from '@blog/db/queries/admin/posts'

/** A post opens in Spanish, or in English when that is all it has. */
export default async function PostPage({ params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params
  const post = isUuid(postId) ? await getPostForEditor(postId) : undefined
  if (!post) {
    notFound()
  }
  redirect(`/admin/entradas/${postId}/${post.translations.es ? 'es' : 'en'}/`)
}
