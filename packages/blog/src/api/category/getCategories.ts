import { categoriesMock } from './categories.mock'

export async function getCategories(): Promise<CategoryResponse> {
  return Promise.resolve(categoriesMock)
}
