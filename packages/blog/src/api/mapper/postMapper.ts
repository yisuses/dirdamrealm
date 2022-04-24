import { categoryMapper } from './categoryMapper'

export const postMapper = (id: number, postEntity: PostResponseEntity, locale: AppLocales): Post => {
  return {
    id,
    title: postEntity[`title_${locale}`],
    summary: postEntity[`summary_${locale}`],
    imgUrl: postEntity.imgUrl,
    publishedAt: postEntity.publishedAt,
    categories: postEntity.categories.data.map(({ id, attributes }) => categoryMapper(id, attributes)),
    ...(postEntity[`content_${locale}`] && { content: postEntity[`content_${locale}`] }),
    ...(postEntity.createdAt && { content: postEntity.createdAt }),
    ...(postEntity.updatedAt && { content: postEntity.updatedAt }),
  }
}
