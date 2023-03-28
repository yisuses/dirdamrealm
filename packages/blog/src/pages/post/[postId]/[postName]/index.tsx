import { ParsedUrlQuery } from 'querystring'
import * as Sentry from '@sentry/nextjs'
import { dehydrate, QueryClient } from '@tanstack/react-query'
import type { GetServerSideProps, NextPage } from 'next'

import { getLatestPosts, getPostById, getComments } from '@api'
import { withErrorComponent, WithErrorProps, PostPage as PostPageComponent } from '@components'
import { getServerTranslations } from '@core/i18n'
import { buildPostPath, handlePageError, NotFoundError, seoName } from '@utils'
import { getLatestPostsCategoryKey, getPostCommentsKey, getPostKey } from '@utils/constants'

const PostPage: NextPage<PostPageProps> = ({ post, comments, sameCategoryPosts, postCommentIds }) => {
  return (
    <PostPageComponent
      post={post}
      comments={comments}
      sameCategoryPosts={sameCategoryPosts}
      postCommentIds={postCommentIds}
    />
  )
}

export interface UrlParams extends ParsedUrlQuery {
  postId: string
  postName: string
}

export const getServerSideProps: GetServerSideProps<PostPageProps | WithErrorProps, UrlParams> = async ({
  params,
  res,
  locale,
  defaultLocale,
}) => {
  let post: Post | undefined = undefined
  const queryClient = new QueryClient()

  try {
    if (!params?.postId || !/^[0-9]+$/.test(params.postId)) {
      throw new NotFoundError(`Post id should be numeric. ${params!.postId} was sent instead.`)
    }

    const postId = Number(params.postId)
    try {
      const postKey = getPostKey(postId)
      queryClient.prefetchQuery(postKey, () => getPostById({ id: postId }))
      post = await queryClient.ensureQueryData(postKey)
    } catch (error) {
      Sentry.captureException(error)
    }

    if (!post) {
      const errMessage = `Post with id '${params.postId}' not found.`
      Sentry.captureException(errMessage)
      throw new NotFoundError(errMessage)
    } else if (!post?.publishedAt) {
      const errMessage = `Post with id '${params.postId}' has not been released yet. It is on draft mode.`
      Sentry.captureException(errMessage)
      throw new NotFoundError(errMessage)
    }

    if (post.locale !== locale) {
      // we are in a different locale. Switch for the localized entry if exists
      const postInLocaleId = post.localizations?.find(post => post.locale === locale)?.id || undefined
      if (postInLocaleId) {
        const postInLocale = (await getPostById({ id: Number(postInLocaleId) })) as Post
        const postInLocalePath = buildPostPath(String(postInLocale.id), postInLocale.title)
        return {
          redirect: {
            destination: `${locale !== defaultLocale ? `/${locale}` : ''}${postInLocalePath}`,
            permanent: true,
          },
        }
      }
    }

    const seoFriendlyName = seoName(post.title)
    const postNameNotCorrect = params?.postName !== seoFriendlyName

    if (postNameNotCorrect) {
      const postPath = buildPostPath(params.postId, post.title)

      return {
        redirect: {
          destination: postPath,
          permanent: true,
        },
      }
    }
  } catch (error) {
    Sentry.captureException(error)
    return handlePageError(error as Error, res)
  }

  let sameCategoryPosts: Post[] | undefined = undefined
  if (post?.categories?.length) {
    try {
      const postId = Number(params.postId)

      const latestPostsCategoryKey = getLatestPostsCategoryKey(`${postId}`)
      queryClient.prefetchQuery(latestPostsCategoryKey, () =>
        getLatestPosts({
          locale: locale as AppLocales,
          category: post?.categories?.[0]?.code,
          limit: 4,
        }),
      )
      const latestCategoryPosts = await queryClient.ensureQueryData<Post[] | undefined>(latestPostsCategoryKey)
      sameCategoryPosts = latestCategoryPosts?.filter(categoryPost => categoryPost.id !== post?.id)
    } catch (error) {
      Sentry.captureException(error)
    }
  }

  let comments: Commentary[] = []
  let postIds: number[] = []
  try {
    postIds = post.localizations ? [...post.localizations.map(localization => localization.id), post.id] : [post.id]
    const postCommentsKey = getPostCommentsKey(postIds)
    queryClient.prefetchQuery(postCommentsKey, () => getComments({ ids: postIds }))
    comments = await queryClient.ensureQueryData(postCommentsKey)
  } catch (error) {
    Sentry.captureException(error)
  }

  return {
    props: {
      post,
      comments,
      sameCategoryPosts,
      postCommentIds: postIds,
      dehydratedState: dehydrate(queryClient),
      ...(locale && (await getServerTranslations(locale, ['common', 'postPage']))),
    },
  }
}

export default withErrorComponent<PostPageProps>(PostPage)

export type PostPageProps = {
  post: Post
  comments: Commentary[]
  sameCategoryPosts: Post[] | undefined
  postCommentIds: number[]
}
