import { categoryMapper } from './categoryMapper'
import { mediaMapper } from './mediaMapper'

export const postMapper = (postEntity: StrapiDataItem<PostResponseEntity>, locale: AppLocales = 'en'): Post => {
  return {
    id: postEntity.id,
    ...postEntity.attributes,
    categories: postEntity.attributes.categories.data.map(category => categoryMapper(category, locale)),
    coverImage:
      postEntity.attributes.coverImage && postEntity.attributes.coverImage.data
        ? mediaMapper(postEntity.attributes.coverImage.data)
        : null,
  }
}
