export const aboutMapper = (aboutEntity: StrapiDataItem<AboutResponseEntity>): About => {
  return { ...aboutEntity }
}
