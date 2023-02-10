import axios from 'axios'
import { stringify } from 'qs'

import { postMapper } from '@api/mapper'
import { apiUrl } from '@utils'

type GetPostByIdParams = {
  id: number
}

export async function getPostById({ id }: GetPostByIdParams): Promise<Post | undefined> {
  const query = stringify({
    populate: { categories: true, coverImage: true, localizations: true, writer: true },
  })
  return axios
    .get<PostSingleResponse>(apiUrl(`/api/posts/${id}?${query}`))
    .then(({ data: response }) => (response.data ? postMapper(response.data) : undefined))
    .catch(() => {
      throw new Error(`Error retrieving post with id ${id}.`)
    })
}
