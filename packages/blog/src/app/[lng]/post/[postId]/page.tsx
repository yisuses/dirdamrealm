import * as sentry from '@sentry/nextjs'
import { notFound, redirect } from 'next/navigation'

import { getPostById } from '@blog/api'
import { DEFAULT_LOCALE } from '@blog/core/i18n/config'
import { buildPostPath } from '@blog/utils'

interface Props {
  params: Promise<{ lng: AppLocales; postId: string }>
}

// /post/:id → redirect to the canonical /post/:id/:slug url.
export default async function Page({ params }: Props) {
  const { lng, postId } = await params
  if (!/^[0-9]+$/.test(postId)) notFound()

  let post: Post | undefined
  try {
    post = await getPostById({ id: Number(postId) })
  } catch (error) {
    sentry.captureException(error)
  }

  if (!post || !post.publishedAt) notFound()

  const prefix = lng === DEFAULT_LOCALE ? '' : `/${lng}`
  redirect(`${prefix}${buildPostPath(String(post.id), post.title)}`)
}
