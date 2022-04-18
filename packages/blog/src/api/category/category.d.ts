type ECategoryCode = `${import('../../enums/categories').CategoryCode}`

interface Category {
  code: ECategoryCode
  main: boolean
  name: string
  description: string
  createdAt: string
  updatedAt: string
}

type CategoryResponse = StrapiResponse<Category>
