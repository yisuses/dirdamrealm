export const categoryMapper = (
  categoryEntity: StrapiDataItem<CategoryResponseEntity>,
  locale: AppLocales,
): Category => {
  const { id, attributes } = categoryEntity
  const localizedName = attributes.locale?.[locale] || attributes.name
  return { id, ...attributes, localizedName }
}

export const algoliaCategoryMapper = (categoryEntity: Category, locale: AppLocales): Category => {
  const { id, ...rest } = categoryEntity
  const localizedName = rest.locale?.[locale] || categoryEntity.name
  return { id, ...rest, localizedName }
}
