import axios from 'axios'
import { stringify } from 'qs'
import { apiUrl } from 'utils'

export async function getLastPost(lang: AppLocales = 'en') {
  const query = stringify({
    sort: ['publishedAt:asc'],
    pagination: { pageSize: 1, page: 1 },
    populate: 'categories',
    publicationState: 'live',
    fields: [`title_${lang}`, `summary_${lang}`, 'imgUrl', 'publishedAt'],
  })
  return axios
    .get<PostResponse>(apiUrl(`/api/posts?${query}`))
    .then(({ data }) => data?.data[0]?.attributes || undefined)
    .catch(() => {
      throw new Error()
    })
}
