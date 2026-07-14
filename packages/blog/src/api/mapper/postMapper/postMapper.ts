import * as sentry from '@sentry/nextjs'
import { DataProp } from 'editorjs-blocks-react-renderer'

import { ApiError } from '@blog/utils'

import { algoliaCategoryMapper, categoryMapper } from '../categorymapper/categoryMapper'
import { mediaMapper } from '../mediaMapper/mediaMapper'
import { writerMapper } from '../writterMapper/writerMapper'

export const postMapper = (postEntity: StrapiDataItem<PostResponseEntity>): Post => {
  const { id } = postEntity
  const errors = []

  let parsedContent: DataProp = { time: new Date().getTime(), version: '', blocks: [] }
  try {
    parsedContent = JSON.parse(postEntity.content)
  } catch (err) {
    errors.push(`Failed to parse content from post ${id}. Cause: ${(err as Error).message}`)
  }

  let parsedCategories: Category[] | null = null
  try {
    parsedCategories = postEntity.categories
      ? postEntity.categories.map(category => categoryMapper(category, postEntity.locale))
      : null
  } catch (err) {
    errors.push(`Failed to parse categories from post ${id}. Cause: ${(err as Error).message}`)
  }

  let parsedLocalizations: Post[] | null = null
  try {
    parsedLocalizations = postEntity.localizations ? postEntity.localizations.map(post => postMapper(post)) : null
  } catch (err) {
    errors.push(`Failed to parse localizations from post ${id}. Cause: ${(err as Error).message}`)
  }

  let parsedCoverImage: Media | null = null
  try {
    parsedCoverImage = postEntity.coverImage ? mediaMapper(postEntity.coverImage) : null
  } catch (err) {
    errors.push(`Failed to parse coverImage from post ${id}. Cause: ${(err as Error).message}`)
  }

  let parsedWriter: Writer | null = null
  try {
    parsedWriter = postEntity.writer ? writerMapper(postEntity.writer) : null
  } catch (err) {
    errors.push(`Failed to parse writer from post ${id}. Cause: ${(err as Error).message}`)
  }

  if (errors.length) {
    throw new ApiError(errors.join('\n'))
  }

  return {
    ...postEntity,
    categories: parsedCategories,
    localizations: parsedLocalizations,
    coverImage: parsedCoverImage,
    content: parsedContent,
    writer: parsedWriter,
  }
}

/**
 * List-friendly wrapper around postMapper: a single malformed post (e.g. unparseable
 * content) is reported and skipped instead of aborting a whole listing / static build.
 */
export const safePostMapper = (postEntity: StrapiDataItem<PostResponseEntity>): Post | null => {
  try {
    return postMapper(postEntity)
  } catch (err) {
    sentry.captureException(err)
    return null
  }
}

export const algoliaPostMapper = (postEntity: AlgoliaPostEntity): Post => {
  const parsedContent: DataProp = { time: new Date().getTime(), version: '', blocks: [] }

  const errors = []

  let parsedCategories: Category[] | null = null
  try {
    parsedCategories = postEntity.categories
      ? postEntity.categories.map(category => algoliaCategoryMapper(category, postEntity.locale))
      : null
  } catch (err) {
    errors.push(`Failed to parse algolia categories from post ${postEntity.objectID}. Cause: ${(err as Error).message}`)
    parsedCategories = []
  }

  if (errors.length) {
    sentry.captureException(errors.join('\n'))
  }

  return {
    id: Number(postEntity.objectID),
    title: postEntity.title,
    summary: postEntity.summary,
    imgUrl: postEntity.imgUrl || '',
    publishedAt: postEntity.publishedAt,
    createdAt: postEntity.createdAt,
    updatedAt: '',
    content: parsedContent,
    coverImage: postEntity.coverImage,
    coverImageAuthor: '',
    coverImageSourceUrl: postEntity.coverImageSourceUrl,
    localizations: null,
    locale: postEntity.locale,
    writer: postEntity.writer,
    categories: parsedCategories,
  }
}
