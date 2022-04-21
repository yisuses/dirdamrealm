import axios from 'axios'
import { apiUrl } from 'utils'
import { categoriesMock } from './categories.mock'

export async function getCategories() {
  return axios
    .get<CategoryResponse>(apiUrl('/api/categories'))
    .then(({ data }) => data)
    .catch(() => Promise.resolve(categoriesMock))
}
