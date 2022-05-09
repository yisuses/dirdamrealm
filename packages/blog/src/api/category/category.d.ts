type ECategoryCode = `${import('../../enums/categories').CategoryCode}`

interface CategoryResponseEntity {
  code: ECategoryCode
  main: boolean
  name: string
  description: string
  createdAt: string
  updatedAt: string
}

type CategoryResponse = StrapiResponse<CategoryResponseEntity>

type Category = CategoryResponseEntity & {
  id: number
}
