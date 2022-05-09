export const categoryMapper = (categoryEntity: StrapiDataItem<CategoryResponseEntity>): Category => {
  return { id: categoryEntity.id, ...categoryEntity.attributes }
}
