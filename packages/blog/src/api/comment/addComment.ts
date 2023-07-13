import axios from 'axios'

import { apiUrl } from '@blog/utils'

export interface AddCommentProps {
  postId: number
  author: string
  text: string
}

export async function addComment({ postId, author, text }: AddCommentProps) {
  const saveData = {
    data: {
      post: postId,
      author,
      text,
    },
  }
  return axios.post<CommentResponse>(apiUrl(`/api/comments`), saveData).catch(error => {
    throw new Error('Error adding comment.', error)
  })
}
