/* eslint-disable @typescript-eslint/naming-convention */
type Post = {
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
  categories: StrapiMultipleData<Category>
}

type PostResponse = StrapiResponse<Post>
