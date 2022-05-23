import { DataProp } from 'editorjs-blocks-react-renderer'

import { ApiError } from '@utils'
import { categoryMapper } from './categoryMapper'
import { mediaMapper } from './mediaMapper'

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
    errors.push(`Failed to parse categories from post ${id}. Cause: ${(err as Error).message}`)
  }

  let parsedCoverImage: Media | null = null
  try {
    parsedCoverImage = attributes.coverImage?.data ? mediaMapper(attributes.coverImage.data) : null
  } catch (err) {
    errors.push(`Failed to parse categories from post ${id}. Cause: ${(err as Error).message}`)
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
  }
}
