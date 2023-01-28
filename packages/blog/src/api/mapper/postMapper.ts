import * as Sentry from '@sentry/nextjs'
import { DataProp } from 'editorjs-blocks-react-renderer'

import { ApiError } from '@utils'
import { categoryMapper, algoliaCategoryMapper } from './categoryMapper'
import { mediaMapper } from './mediaMapper'
import { writerMapper } from './writerMapper'

export const postMapper = (postEntity: StrapiDataItem<PostResponseEntity>): Post => {
  const { id, attributes } = postEntity
  const errors = []

  let parsedContent: DataProp = { time: new Date().getTime(), version: '', blocks: [] }
  try {
    parsedContent = JSON.parse(attributes.content)
  } catch (err) {
    errors.push(`Failed to parse content from post ${id}. Cause: ${(err as Error).message}`)
  }

  let parsedCategories: Category[] | null = null
  try {
    parsedCategories = attributes.categories
      ? attributes.categories.data.map(category => categoryMapper(category, attributes.locale))
      : null
  } catch (err) {
    errors.push(`Failed to parse categories from post ${id}. Cause: ${(err as Error).message}`)
  }

  let parsedLocalizations: Post[] | null = null
  try {
    parsedLocalizations = attributes.localizations ? attributes.localizations.data.map(post => postMapper(post)) : null
  } catch (err) {
    errors.push(`Failed to parse localizations from post ${id}. Cause: ${(err as Error).message}`)
  }

  let parsedCoverImage: Media | null = null
  try {
    parsedCoverImage = attributes.coverImage?.data ? mediaMapper(attributes.coverImage.data) : null
  } catch (err) {
    errors.push(`Failed to parse coverImage from post ${id}. Cause: ${(err as Error).message}`)
  }

  let parsedWriter: Writer | null = null
  try {
    parsedWriter = attributes.writer?.data ? writerMapper(attributes.writer.data) : null
  } catch (err) {
    errors.push(`Failed to parse writer from post ${id}. Cause: ${(err as Error).message}`)
  }

  if (errors.length) {
    throw new ApiError(errors.join('\n'))
  }

  return {
    id,
    ...attributes,
    categories: parsedCategories,
    localizations: parsedLocalizations,
    coverImage: parsedCoverImage,
    content: parsedContent,
    writer: parsedWriter,
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
    Sentry.captureException(errors.join('\n'))
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
