import axios from 'axios'
import { stringify } from 'qs'

import { categoryMapper } from '@blog/api/mapper'
import { apiUrl } from '@blog/utils'

type GetCategoriesParams = {
  locale: AppLocales
  code?: string
}

export async function getCategories({ locale = 'en', code }: GetCategoriesParams) {
  const query = stringify({
    filters: {
      ...(code && { code }),
    },
  })
  return axios
    .get<CategoryResponse>(apiUrl(`/api/categories?${query}`))
    .then(({ data: response }) => response.data.map(category => categoryMapper(category, locale)))
    .catch(() => {
      throw new Error('Error retrieving categories.')
    })
}
