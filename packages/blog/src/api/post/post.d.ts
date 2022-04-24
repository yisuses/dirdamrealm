/* eslint-disable @typescript-eslint/naming-convention */
type PostResponseEntity = {
  title_en: string
  title_es: string
  summary_en: string
  summary_es: string
  content_en: string
  content_es: string
  imgUrl: string
  createdAt: string
  updatedAt: string
  publishedAt: string
  categories: StrapiMultipleData<CategoryResponseEntity>
}

type PostResponse = StrapiResponse<PostResponseEntity>

type Post = {
  id: number
  title: string
  summary: string
  imgUrl: string
  publishedAt: string
  categories: Category[]
  content?: string
  createdAt?: string
  updatedAt?: string
}
