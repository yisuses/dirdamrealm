import axios from 'axios'
import { stringify } from 'qs'

import { postMapper } from '@blog/api/mapper'
import { apiUrl } from '@blog/utils'

type GetAllPostParams = {
  locale?: AppLocales
}

export async function getAllPosts({ locale }: GetAllPostParams): Promise<Post[] | undefined> {
  const query = stringify({
    sort: ['updatedAt:desc'],
    publicationState: 'live',
    populate: ['localizations', 'coverImage'],
    locale,
  })

  return axios
    .get<PostResponse>(apiUrl(`/api/posts?${query}`))
    .then(({ data: response }) =>
      response.data.map(postMapper).filter(({ localizations }) => {
        if (localizations?.length) {
          return localizations.findIndex(({ locale: postLocale }) => postLocale === locale) < 0
        }
        return true
      }),
    )
    .catch(err => {
      console.error(err)
      throw new Error('Error retrieving posts.')
    })
}
