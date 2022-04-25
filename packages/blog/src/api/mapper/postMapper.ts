import { categoryMapper } from './categoryMapper'

export const postMapper = (postEntity: StrapiDataItem<PostResponseEntity>): Post => {
  const postAttributes = postEntity.attributes
  return {
    id: postEntity.id,
    title: postAttributes.title,
    summary: postAttributes.summary,
    imgUrl: postAttributes.imgUrl,
    publishedAt: postAttributes.publishedAt,
    categories: postAttributes.categories.data.map(category => categoryMapper(category)),
    content: postAttributes.content,
    createdAt: postAttributes.createdAt,
    updatedAt: postAttributes.updatedAt,
  }
}
