interface CategoryResponseEntity {
  code: string
  main: boolean
  name: string
  locale?: Record<AppLocales, string>
  description: string
  createdAt: string
  updatedAt: string
}

type CategoryResponse = StrapiResponse<CategoryResponseEntity>
type CategorySingleResponse = StrapiSingleResponse<CategoryResponseEntity>

type Category = CategoryResponseEntity & {
  id: number
  localizedName: string
}
