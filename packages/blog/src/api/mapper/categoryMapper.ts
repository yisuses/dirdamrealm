export const categoryMapper = (id: number, categoryEntity: CategoryResponseEntity): Category => {
  return { id, ...categoryEntity }
}
