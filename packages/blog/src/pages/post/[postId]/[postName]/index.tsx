import { ParsedUrlQuery } from 'querystring'
import type { GetServerSideProps, NextPage } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import { getAbout, getPostById } from '@api'
import { withErrorComponent, WithErrorProps, PostPage as PostPageComponent } from '@components'
import { ApiError, buildPostPath, handlePageError, NotFoundError, seoName } from '@utils'

const PostPage: NextPage<PostPageProps> = ({ post, about }) => {
  return <PostPageComponent post={post} about={about} />
}

export interface UrlParams extends ParsedUrlQuery {
  postId: string
  postName: string
}

export const getServerSideProps: GetServerSideProps<PostPageProps | WithErrorProps, UrlParams> = async ({
  params,
  res,
  locale,
}) => {
  let post: Post | undefined = undefined
  let about: About | undefined = undefined

  try {
    if (!params?.postId || !/^[0-9]+$/.test(params.postId)) {
      throw new NotFoundError(`Post id should be numeric. ${params!.postId} was sent instead.`)
    }

    const postRequest = getPostById({ id: Number(params.postId) })
    const aboutRequest = getAbout()

    const [responsePost, responseAbout] = await Promise.all([postRequest, aboutRequest])
    post = responsePost
    about = responseAbout

    if (!post) {
      throw new NotFoundError(`Post with id '${params!.postId}' not found.`)
    }

    if (!about) {
      throw new ApiError(`Problem retrieving about data when loading post '${params!.postId}'`)
    }

    if (post.locale !== locale) {
      // we are in a different locale. Switch for the localized entry if exists
      const postInLocaleId = post.localizations?.find(post => post.locale === locale)?.id || undefined
      if (postInLocaleId) {
        const postInLocale = (await getPostById({ id: Number(postInLocaleId) })) as Post
        const postInLocalePath = buildPostPath(String(postInLocale.id), postInLocale.title)
        return {
          redirect: {
            destination: postInLocalePath,
            permanent: true,
          },
        }
      } else {
        // no localized entry exists. Redirect to the home page
        return {
          redirect: {
            destination: '/',
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
    return handlePageError(error as Error, res)
  }

  return {
    props: {
      post,
      about,
      ...(locale && (await serverSideTranslations(locale, ['common', 'postPage']))),
    },
  }
}

export default withErrorComponent<PostPageProps>(PostPage)

export type PostPageProps = {
  post: Post
  about: About
}
