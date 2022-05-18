import { ParsedUrlQuery } from 'querystring'
import type { GetServerSideProps } from 'next'

import { getPostById } from '@api'
import { withErrorComponent, WithErrorProps } from '@components'
import { buildPostPath, handlePageError, NotFoundError } from '@utils'

export interface UrlParams extends ParsedUrlQuery {
  postId: string
}

export const getServerSideProps: GetServerSideProps<Record<string, never> | WithErrorProps, UrlParams> = async ({
  params,
  res,
}) => {
  try {
    if (!params?.postId || !/^[0-9]+$/.test(params.postId)) {
      throw new NotFoundError(`Post id should be numeric. ${params!.postId} was sent instead.`)
    }

    const post = await getPostById({ id: Number(params.postId) })

    if (!post) {
      throw new NotFoundError(`Post with code '${params!.postId}' not found`)
    }

    const postPath = buildPostPath(params.postId, post.title)

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
