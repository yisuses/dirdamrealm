interface CommentResponseEntity {
  text: string
  author: string
  createdAt: string
  updatedAt: string
}

type CommentResponse = StrapiResponse<CommentResponseEntity>

type Commentary = CommentResponseEntity & {
  id: number
}
