import axios from 'axios'

export interface AddCommentValidateProps {
  postId: number
  author: string
  text: string
  captcha: string | null
}

export async function addCommentValidate({ postId, author, text, captcha }: AddCommentValidateProps) {
  const data = {
    postId,
    author,
    text,
    captcha,
  }
  return axios
    .post('/api/addComment', data)
    .then(() => ({ status: 'OK' }))
    .catch(error => {
      throw new Error('Error validating comment.', error)
    })
}
