import { ParsedUrlQuery } from 'querystring'
import * as Sentry from '@sentry/nextjs'
import { dehydrate, QueryClient } from '@tanstack/react-query'
import type { GetServerSideProps, NextPage } from 'next'

import { getLatestPosts, getPostById, getComments } from '@api'
import { withErrorComponent, WithErrorProps, PostPage as PostPageComponent } from '@components'
import { getServerTranslations } from '@core/i18n'
import { buildPostPath, handlePageError, NotFoundError, seoName } from '@utils'
import { getLatestPostsCategoryKey, getPostCommentsKey, getPostKey } from '@utils/constants'

const PostPage: NextPage = () => {
  return <PostPageComponent />
}

export interface UrlParams extends ParsedUrlQuery {
  postId: string
  postName: string
}

export const getServerSideProps: GetServerSideProps<Record<string, unknown> | WithErrorProps, UrlParams> = async ({
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

    let errMessage
    if (!post) {
      errMessage = `Post with id '${params.postId}' not found.`
    } else if (!post?.publishedAt) {
      errMessage = `Post with id '${params.postId}' has not been released yet. It is on draft mode.`
    }
    if (!post || errMessage) {
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

  if (post?.categories?.length) {
    try {
      const categoryCode = post.categories[0].code
      const latestPostsCategoryKey = getLatestPostsCategoryKey(categoryCode)
      await queryClient.prefetchQuery(latestPostsCategoryKey, () =>
        getLatestPosts({
          locale: locale as AppLocales,
          category: categoryCode,
          limit: 8,
        }),
      )
    } catch (error) {
      Sentry.captureException(error)
    }
  }

  try {
    const postIds = post.localizations
      ? [...post.localizations.map(localization => localization.id), post.id]
      : [post.id]
    const postCommentsKey = getPostCommentsKey(postIds)
    await queryClient.prefetchQuery(postCommentsKey, () => getComments({ ids: postIds }))
  } catch (error) {
    Sentry.captureException(error)
  }

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
      ...(locale && (await getServerTranslations(locale, ['common', 'postPage']))),
    },
  }
}

export default withErrorComponent(PostPage)
