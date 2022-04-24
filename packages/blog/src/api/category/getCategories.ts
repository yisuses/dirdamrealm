import axios from 'axios'
import { categoryMapper } from 'api/mapper'
import { apiUrl } from 'utils'

export async function getCategories() {
  return axios
    .get<CategoryResponse>(apiUrl('/api/categories'))
    .then(({ data: response }) => response.data.map(({ id, attributes }) => categoryMapper(id, attributes)))
    .catch(() => {
      throw new Error('Error retrieving categories.')
    })
}
