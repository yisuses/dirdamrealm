interface CommentResponseEntity {
  text: string
  author: boolean
  createdAt: string
  updatedAt: string
}

type CommentResponse = StrapiResponse<CommentResponseEntity>

type Commentary = CommentResponseEntity & {
  id: number
}
