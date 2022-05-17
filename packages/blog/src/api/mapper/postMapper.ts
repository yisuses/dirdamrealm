import { categoryMapper } from './categoryMapper'
import { mediaMapper } from './mediaMapper'

export const postMapper = (postEntity: StrapiDataItem<PostResponseEntity>): Post => {
  const { id, attributes } = postEntity
  return {
    id,
    ...attributes,
    categories: attributes.categories
      ? attributes.categories.data.map(category => categoryMapper(category, attributes.locale))
      : null,
    coverImage: attributes.coverImage?.data ? mediaMapper(attributes.coverImage.data) : null,
    localizations: attributes.localizations ? attributes.localizations.data.map(post => postMapper(post)) : null,
  }
}
