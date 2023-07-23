import axios from 'axios'
import { stringify } from 'qs'

import { categoryMapper } from '@blog/api/mapper'
import { apiUrl } from '@blog/utils'

type GetCategoriesParams = {
  locale?: AppLocales
  code?: string
  sort?: string[]
}

export async function getCategories({ locale = 'en', code, sort }: GetCategoriesParams) {
  const query = stringify({
    filters: {
      ...(code && { code }),
    },
    sort,
  })
  return axios
    .get<CategoryResponse>(apiUrl(`/api/categories?${query}`))
    .then(({ data: response }) => response.data.map(category => categoryMapper(category, locale)))
    .catch(() => {
      throw new Error('Error retrieving categories.')
    })
}
