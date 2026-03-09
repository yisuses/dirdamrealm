import axios from 'axios'
import { stringify } from 'qs'

import { postMapper } from '@blog/api/mapper'
import { apiUrl, getLocalizedPosts } from '@blog/utils'

type GetAllPostParams = {
  locale?: AppLocales
}

export async function getAllPosts({ locale }: GetAllPostParams): Promise<Post[] | undefined> {
  const query = stringify({
    sort: ['updatedAt:desc'],
    publicationState: 'live',
    populate: ['localizations', 'coverImage'],
    locale: ['en', 'es'],
    pagination: {
      page: 1,
      pageSize: 100000,
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
      throw new Error('Error retrieving posts.')
    })
}
