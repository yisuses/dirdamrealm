import { categoryMapper } from './categoryMapper'

export const postMapper = (postEntity: StrapiDataItem<PostResponseEntity>): Post => {
  return {
    id: postEntity.id,
    ...postEntity.attributes,
    categories: postEntity.attributes.categories.data.map(category => categoryMapper(category)),
  }
}
