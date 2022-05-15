import axios from 'axios'
import { stringify } from 'qs'

import { postMapper } from '@api/mapper'
import { apiUrl } from '@utils'

type GetLatestPostParams = {
  lang: AppLocales
  category?: string
}

export async function getLatestPosts({ lang = 'es', category }: GetLatestPostParams): Promise<Post[] | undefined> {
  const query = stringify({
    sort: ['publishedAt:desc'],
    pagination: { pageSize: 8, page: 1 },
    populate: 'categories,coverImage',
    publicationState: 'live',
    locale: lang,
    filters: {
      ...(category && { categories: { code: category } }),
    },
  })
  return axios
    .get<PostResponse>(apiUrl(`/api/posts?${query}`))
    .then(({ data: response }) => response.data.map(post => postMapper(post)))
    .catch(() => {
      throw new Error('Error retrieving latest posts.')
    })
}
