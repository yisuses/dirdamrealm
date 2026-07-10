export const categoryMapper = (
  categoryEntity: StrapiDataItem<CategoryResponseEntity>,
  locale: AppLocales,
): Category => {
  const localizedName = categoryEntity.translations?.[locale] || categoryEntity.name
  return { ...categoryEntity, localizedName }
}

export const algoliaCategoryMapper = (categoryEntity: Category, locale: AppLocales): Category => {
  const { id, ...rest } = categoryEntity
  const localizedName = rest.translations?.[locale] || categoryEntity.name
  return { id, ...rest, localizedName }
}
