import axios from 'axios'
import { stringify } from 'qs'

import { postMapper } from 'api/mapper'
import { apiUrl } from 'utils'

export async function getLastPost(lang: AppLocales = 'en'): Promise<Post | undefined> {
  const query = stringify({
    sort: ['publishedAt:asc'],
    pagination: { pageSize: 1, page: 1 },
    populate: 'categories',
    publicationState: 'live',
    locale: lang,
  })
  return axios
    .get<PostResponse>(apiUrl(`/api/posts?${query}`))
    .then(({ data: response }) => {
      const postData = response.data[0]
      return postData ? postMapper(postData) : undefined
    })
    .catch(() => {
      throw new Error('Error retrieving last post.')
    })
}
