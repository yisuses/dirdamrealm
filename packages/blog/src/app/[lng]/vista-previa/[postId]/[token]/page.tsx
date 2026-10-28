import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { PostPage } from '@blog/components'
import { PreviewBanner } from '@blog/components/post/PreviewBanner/PreviewBanner'
import { getQueryClient } from '@blog/core/query/get-query-client'
import { isUuid } from '@blog/core/validation/uuid'
import { getPreviewPostFromDb } from '@blog/db/queries/posts'
import { getPostKey } from '@blog/utils/constants'

// A secret link to unpublished edits: always fresh, never cached, never indexed.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = { robots: { index: false, follow: false } }

interface PreviewPageProps {
  params: Promise<{ lng: AppLocales; postId: string; token: string }>
}

export default async function PreviewPage({ params }: PreviewPageProps) {
  const { postId, token } = await params
  if (!/^[0-9]{1,9}$/.test(postId) || !isUuid(token)) {
    notFound()
  }
  const post = await getPreviewPostFromDb({ id: Number(postId), token })
  if (!post) {
    notFound()
  }

  const queryClient = getQueryClient()
  queryClient.setQueryData(getPostKey(post.id), post)
  return (
    <>
      <PreviewBanner />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <PostPage />
      </HydrationBoundary>
    </>
  )
}
