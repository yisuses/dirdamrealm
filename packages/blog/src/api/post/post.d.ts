/* eslint-disable @typescript-eslint/naming-convention */
type PostResponseEntity = {
  title: string
  summary: string
  content: string
  imgUrl: string
  createdAt: string
  updatedAt: string
  publishedAt: string
  categories: StrapiMultipleData<CategoryResponseEntity>
  coverImage?: StrapiData<MediaResponseEntity>
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
  coverImage: Media | null
}
