import { ParsedUrlQuery } from 'querystring'
import * as Sentry from '@sentry/nextjs'
import { QueryClient } from '@tanstack/react-query'
import type { GetServerSideProps } from 'next'

import { getPostById } from '@api'
import { withErrorComponent, WithErrorProps } from '@components'
import { buildPostPath, handlePageError, NotFoundError } from '@utils'
import { getPostKey } from '@utils/constants'

export interface UrlParams extends ParsedUrlQuery {
  postId: string
}

export const getServerSideProps: GetServerSideProps<Record<string, never> | WithErrorProps, UrlParams> = async ({
  params,
  res,
}) => {
  const queryClient = new QueryClient()
  try {
    if (!params?.postId || !/^[0-9]+$/.test(params.postId)) {
      throw new NotFoundError(`Post id should be numeric. ${params!.postId} was sent instead.`)
    }

    const postId = Number(params.postId)
    const postKey = getPostKey(postId)
    queryClient.prefetchQuery(postKey, () => getPostById({ id: postId }))
    const post = await queryClient.ensureQueryData<Post | undefined>(postKey)

    if (!post) {
      const errMessage = `Post with code '${postId}' not found`
      Sentry.captureException(errMessage)
      throw new NotFoundError(`Post with code '${postId}' not found`)
    } else if (!post?.publishedAt) {
      const errMessage = `Post with id '${postId}' has not been released yet. It is on draft mode.`
      Sentry.captureException(errMessage)
      throw new NotFoundError(errMessage)
    }

    const postPath = buildPostPath(postId, post.title)

    return {
      redirect: {
        destination: postPath,
        permanent: true,
      },
    }
  } catch (error) {
    return handlePageError(error as Error, res)
  }
}

const Index = () => <div />

export default withErrorComponent(Index)
