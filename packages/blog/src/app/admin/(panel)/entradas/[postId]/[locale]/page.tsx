import { notFound } from 'next/navigation'

import { PostEditor } from '@blog/components/admin/posts/editor/PostEditor'
import { localeSchema } from '@blog/core/validation/post'
import { isUuid } from '@blog/core/validation/uuid'
import { getPostForEditor, listEditorOptions } from '@blog/db/queries/admin/posts'

interface EditPostPageProps {
  params: Promise<{ postId: string; locale: string }>
  searchParams: Promise<{ v?: string }>
}

export default async function EditPostPage({ params, searchParams }: EditPostPageProps) {
  const { postId, locale } = await params
  const { v: version = '' } = await searchParams
  const parsedLocale = localeSchema.safeParse(locale)
  const post = isUuid(postId) && parsedLocale.success ? await getPostForEditor(postId) : undefined
  const translation = post && parsedLocale.success ? post.translations[parsedLocale.data] : undefined
  if (!post || !translation) {
    notFound()
  }
  const { writers, categories } = await listEditorOptions()
  // A fresh editor for each language, and after each action (publish, discard…), which adds `?v=`.
  const key = `${locale}:${version}`
  return <PostEditor key={key} post={post} locale={parsedLocale.data!} writers={writers} categories={categories} />
}
