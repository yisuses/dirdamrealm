import { categoryMapper } from './categoryMapper'

export const postMapper = (postEntity: StrapiDataItem<PostResponseEntity>, locale: AppLocales): Post => {
  const postAttributes = postEntity.attributes
  return {
    id: postEntity.id,
    title: postAttributes[`title_${locale}`],
    summary: postAttributes[`summary_${locale}`],
    imgUrl: postAttributes.imgUrl,
    publishedAt: postAttributes.publishedAt,
    categories: postAttributes.categories.data.map(category => categoryMapper(category)),
    ...(postAttributes[`content_${locale}`] && { content: postAttributes[`content_${locale}`] }),
    ...(postAttributes.createdAt && { content: postAttributes.createdAt }),
    ...(postAttributes.updatedAt && { content: postAttributes.updatedAt }),
  }
}
