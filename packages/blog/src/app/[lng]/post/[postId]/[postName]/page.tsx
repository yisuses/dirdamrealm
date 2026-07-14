import * as sentry from '@sentry/nextjs'
import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import { parseISO } from 'date-fns'
import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { cache } from 'react'
import { BlogPosting } from 'schema-dts'

import { getAbout, getComments, getLatestPosts, getPostById } from '@blog/api'
import { getAllPosts } from '@blog/api/post'
import { JsonLd, PostPage } from '@blog/components'
import { DEFAULT_LOCALE, LOCALES } from '@blog/core/i18n/config'
import { getServerT } from '@blog/core/i18n/server'
import { buildPageMetadata } from '@blog/core/metadata/build-metadata'
import { getQueryClient } from '@blog/core/query/get-query-client'
import {
  buildPostPath,
  getImageDataFromMedia,
  getImageUrlFromMedia,
  getPlainText,
  publicUrl,
  seoName,
} from '@blog/utils'
import { getLatestPostsKey, getPostCommentsKey, getPostKey } from '@blog/utils/constants'

export const revalidate = 3600

interface PostPageProps {
  params: Promise<{ lng: AppLocales; postId: string; postName: string }>
}

// Deduped per request so generateMetadata + the page share a single fetch.
const getPost = cache(async (id: number) => {
  try {
    return await getPostById({ id })
  } catch (error) {
    sentry.captureException(error)
    return undefined
  }
})

const localePrefix = (lng: AppLocales) => (lng === DEFAULT_LOCALE ? '' : `/${lng}`)

export async function generateStaticParams() {
  const perLocale = await Promise.all(
    LOCALES.map(async lng => {
      const posts = (await getAllPosts({ locale: lng }).catch(() => [] as Post[])) || []
      return posts
        .filter(post => post && typeof post.title === 'string' && post.title && post.id != null)
        .map(post => ({ lng, postId: String(post.id), postName: seoName(post.title) }))
    }),
  )
  return perLocale.flat()
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { lng, postId } = await params
  if (!/^[0-9]+$/.test(postId)) return {}

  const [post, { t: tCommon }, { t }, about] = await Promise.all([
    getPost(Number(postId)),
    getServerT(lng, 'common'),
    getServerT(lng, 'postPage'),
    getAbout().catch(() => undefined),
  ])
  if (!post) return {}

  const { title, summary, coverImage, imgUrl, publishedAt, updatedAt, categories, writer } = post
  return buildPageMetadata({
    lng,
    pageTitle: tCommon('pageTitle'),
    name: t('postPage.title', { postName: title }),
    description: summary,
    path: buildPostPath(String(post.id), title),
    type: 'article',
    imageUrl: getImageUrlFromMedia({ media: coverImage, format: 'medium', fallback: imgUrl }),
    article: {
      publishedTime: publishedAt,
      modifiedTime: updatedAt || undefined,
      section: categories?.[0]?.localizedName || undefined,
      authors: writer?.name ? [writer.name] : undefined,
    },
    twitter: {
      title,
      description: summary,
      image: getImageUrlFromMedia({ media: coverImage, format: 'small', fallback: imgUrl }),
      imageAlt: coverImage ? coverImage.caption : '',
      creator: writer?.twitter || about?.twitter || undefined,
    },
  })
}

export default async function Page({ params }: PostPageProps) {
  const { lng, postId, postName } = await params

  if (!/^[0-9]+$/.test(postId)) notFound()

  const post = await getPost(Number(postId))
  if (!post || !post.publishedAt) notFound()

  // Switch to the localized entry when landing on the wrong locale.
  if (post.locale !== lng) {
    const localizedId = post.localizations?.find(localization => localization.locale === lng)?.id
    if (localizedId) {
      const localized = await getPost(Number(localizedId))
      if (localized) redirect(`${localePrefix(lng)}${buildPostPath(String(localized.id), localized.title)}`)
    }
  }

  // Canonicalize the slug.
  if (postName !== seoName(post.title)) {
    redirect(`${localePrefix(lng)}${buildPostPath(String(post.id), post.title)}`)
  }

  const queryClient = getQueryClient()
  queryClient.setQueryData(getPostKey(Number(postId)), post)

  const postCommentIds = post.localizations
    ? [...post.localizations.map(localization => localization.id), post.id]
    : [post.id]

  const prefetches: Promise<unknown>[] = [
    queryClient.prefetchQuery({
      queryKey: getPostCommentsKey(postCommentIds),
      queryFn: () => getComments({ ids: postCommentIds }),
    }),
  ]
  if (post.categories?.length) {
    const categoryCode = post.categories[0].code
    prefetches.push(
      queryClient.prefetchQuery({
        queryKey: getLatestPostsKey(categoryCode),
        queryFn: () => getLatestPosts({ locale: lng, category: categoryCode, limit: 8 }),
      }),
    )
  }
  await Promise.all(prefetches)

  const {
    title,
    content,
    coverImage,
    imgUrl,
    locale: postLocale,
    createdAt,
    publishedAt,
    updatedAt,
    summary,
    writer,
    categories,
  } = post
  const imageData = getImageDataFromMedia({ media: coverImage, format: 'medium' })
  const ldJson: BlogPosting = {
    '@type': 'BlogPosting',
    headline: title,
    name: title,
    alternativeHeadline: summary,
    dateCreated: createdAt,
    datePublished: publishedAt,
    dateModified: updatedAt,
    inLanguage: postLocale,
    isFamilyFriendly: true,
    copyrightYear: parseISO(publishedAt).getFullYear(),
    ...(coverImage && {
      image: {
        '@type': 'ImageObject',
        url: getImageUrlFromMedia({ media: coverImage, format: 'medium', fallback: imgUrl }),
        width: imageData?.width.toString() || '',
        height: imageData?.height.toString() || '',
      },
      thumbnailUrl: getImageUrlFromMedia({ media: coverImage, format: 'small' }),
    }),
    author: { '@type': 'Person', name: writer?.name, url: writer?.personalUrl || '' },
    creator: { '@type': 'Person', name: writer?.name, url: writer?.personalUrl || '' },
    publisher: {
      '@type': 'Organization',
      name: 'White Emotion',
      url: 'https://whemotion.com',
      logo: { '@type': 'ImageObject', url: publicUrl('/images/WElogo.png'), width: '500', height: '500' },
    },
    mainEntityOfPage: publicUrl(`${localePrefix(lng)}${buildPostPath(String(post.id), title)}`),
    articleSection: categories?.[0]?.localizedName || '',
    articleBody: getPlainText(content),
  }

  return (
    <>
      <JsonLd items={[ldJson]} />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <PostPage />
      </HydrationBoundary>
    </>
  )
}
