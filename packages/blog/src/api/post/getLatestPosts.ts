import axios from 'axios'
import { stringify } from 'qs'

import { postMapper } from '@blog/api/mapper'
import { apiUrl, getLocalizedPosts } from '@blog/utils'

type GetLatestPostParams = {
  locale?: AppLocales
  category?: string
  limit?: number
  populate?: string[]
}

export async function getLatestPosts({
  category,
  limit,
  locale,
  populate,
}: GetLatestPostParams): Promise<Post[] | undefined> {
  const query = stringify({
    sort: ['publishedAt:desc'],
    pagination: { pageSize: limit || 100, page: 1 },
    populate: populate || ['categories', 'coverImage', 'localizations'],
    publicationState: 'live',
    locale: ['en', 'es'],
    filters: {
      ...(category && { categories: { code: category } }),
    },
  })

  return axios
    .get<PostResponse>(apiUrl(`/api/posts?${query}`))
    .then(({ data: response }) => {
      const mappedPosts = response.data.map(postMapper)

      if (!locale) {
        return mappedPosts
      }

      return getLocalizedPosts(mappedPosts, locale)
    })
    .catch(err => {
      console.error(err)
      throw new Error('Error retrieving latest posts.')
    })
}
