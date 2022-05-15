export const categoryMapper = (
  categoryEntity: StrapiDataItem<CategoryResponseEntity>,
  locale: AppLocales,
): Category => {
  const categoryName = categoryEntity.attributes.locale?.[locale] || categoryEntity.attributes.name
  return { id: categoryEntity.id, ...categoryEntity.attributes, name: categoryName }
}
