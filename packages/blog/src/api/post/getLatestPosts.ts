import axios from 'axios'
import { stringify } from 'qs'

import { postMapper } from '@api/mapper'
import { apiUrl } from '@utils'

type GetLatestPostParams = {
  locale?: AppLocales
  category?: string
  limit?: number
}

export async function getLatestPosts({ category, limit, locale }: GetLatestPostParams): Promise<Post[] | undefined> {
  const query = stringify({
    sort: ['publishedAt:desc'],
    pagination: { pageSize: limit || 8, page: 1 },
    populate: ['categories', 'coverImage'],
    publicationState: 'live',
    locale: locale || ['en', 'es'],
    filters: {
      ...(category && { categories: { code: category } }),
    },
  })

  return axios
    .get<PostResponse>(apiUrl(`/api/posts?${query}`))
    .then(({ data: response }) => response.data.map(postMapper))
    .catch(err => {
      console.error(err)
      throw new Error('Error retrieving latest posts.')
    })
}
