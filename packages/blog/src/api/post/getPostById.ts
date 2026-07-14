import axios from 'axios'
import { stringify } from 'qs'

import { postMapper } from '@blog/api/mapper'
import { apiUrl } from '@blog/utils'

type GetPostByIdParams = {
  id: number
}

export async function getPostById({ id }: GetPostByIdParams): Promise<Post | undefined> {
  // Strapi v5 keys findOne by `documentId`, not the numeric id, so `/api/posts/:id`
  // 404s for our numeric ids. Filter by numeric id instead and take the first match.
  // `locale: '*'` searches every locale — a numeric id belongs to one locale entry, and
  // the page must find it regardless of the requested locale (it then redirects to the
  // localized entry if one exists, or falls back to showing the post in its own language).
  const query = stringify({
    filters: { id: { $eq: id } },
    populate: { categories: true, coverImage: true, localizations: true, writer: true },
    locale: '*',
  })
  return axios
    .get<PostResponse>(apiUrl(`/api/posts?${query}`))
    .then(({ data: response }) => (response.data?.[0] ? postMapper(response.data[0]) : undefined))
    .catch(() => {
      throw new Error(`Error retrieving post with id ${id}.`)
    })
}
