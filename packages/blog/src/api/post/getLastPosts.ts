import axios from 'axios'
import { stringify } from 'qs'

import { postMapper } from 'api/mapper'
import { apiUrl } from 'utils'

export async function getLastPosts(lang: AppLocales = 'es'): Promise<Post[] | undefined> {
  const query = stringify({
    sort: ['publishedAt:desc'],
    pagination: { pageSize: 20, page: 1 },
    populate: 'categories,coverImage',
    publicationState: 'live',
    locale: lang,
  })
  return axios
    .get<PostResponse>(apiUrl(`/api/posts?${query}`))
    .then(({ data: response }) => response.data.map(post => postMapper(post)))
    .catch(() => {
      throw new Error('Error retrieving last post.')
    })
}
