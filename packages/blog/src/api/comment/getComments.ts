import axios from 'axios'
import { stringify } from 'qs'

import { commentMapper } from '@api/mapper'
import { apiUrl } from '@utils'

type GetCommentsParams = {
  ids?: number[]
}

export async function getComments({ ids }: GetCommentsParams) {
  const query = stringify({
    sort: ['createdAt:desc'],
    filters: {
      post: {
        id: {
          $in: ids,
        },
      },
    },
  })
  return axios
    .get<CommentResponse>(apiUrl(`/api/comments?${query}`))
    .then(({ data: response }) => response.data.map(comment => commentMapper(comment)))
    .catch(() => {
      throw new Error('Error retrieving comments.')
    })
}
