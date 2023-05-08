export const aboutMapper = (aboutEntity: StrapiDataItem<AboutResponseEntity>): About => {
  return { id: aboutEntity.id, ...aboutEntity.attributes }
}
