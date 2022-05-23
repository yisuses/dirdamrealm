export const categoryMapper = (
  categoryEntity: StrapiDataItem<CategoryResponseEntity>,
  locale: AppLocales,
): Category => {
  const { id, attributes } = categoryEntity
  const localizedName = attributes.locale?.[locale] || attributes.name
  return { id, ...attributes, localizedName }
}
