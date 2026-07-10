export const commentMapper = (commentEntity: StrapiDataItem<CommentResponseEntity>): Commentary => {
  return { ...commentEntity }
}
