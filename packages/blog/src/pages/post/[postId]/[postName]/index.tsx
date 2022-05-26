import { ParsedUrlQuery } from 'querystring'
import type { GetServerSideProps, NextPage } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import { getPostById } from '@api'
import { withErrorComponent, WithErrorProps, PostPage as PostPageComponent } from '@components'
import { buildPostPath, handlePageError, NotFoundError, seoName } from '@utils'

const PostPage: NextPage<PostPageProps> = ({ post }) => {
  return <PostPageComponent post={post} />
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
  let finalLocale: AppLocales = 'es'

  try {
    if (!params?.postId || !/^[0-9]+$/.test(params.postId)) {
      throw new NotFoundError(`Post id should be numeric. ${params!.postId} was sent instead.`)
    }

    post = await getPostById({ id: Number(params.postId) })

    if (!post) {
      throw new NotFoundError(`Post with id '${params!.postId}' not found.`)
    }

    finalLocale = (locale || post.locale) as AppLocales

    if (post.locale !== finalLocale) {
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
      ...(finalLocale && (await serverSideTranslations(finalLocale, ['common', 'postPage']))),
    },
  }
}

export default withErrorComponent<PostPageProps>(PostPage)

export type PostPageProps = {
  post: Post
}
