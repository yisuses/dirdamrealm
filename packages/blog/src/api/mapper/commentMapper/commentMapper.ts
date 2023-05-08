export const commentMapper = (commentEntity: StrapiDataItem<CommentResponseEntity>): Commentary => {
  const { id, attributes } = commentEntity
  return { id, ...attributes }
}
