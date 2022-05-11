/* eslint-disable @typescript-eslint/naming-convention */
type MediaFormat = {
  ext: string
  url: string
  hash: string
  mime: string
  name: string
  path: string | null
  size: number
  width: number
  height: number
  provider_metadata: {
    public_id: string
    resource_type: string
  }
}

type MediaResponseEntity = {
  name: string
  alternativeText: string
  caption: string
  width: number
  height: number
  formats: Record<string, MediaFormat>
  hash: string
  ext: string
  mime: string
  size: number
  url: string
  previewUrl: string | null
  provider: string
  provider_metadata: {
    public_id: string
    resource_type: string
  }
  createdAt: string
  updatedAt: string
}

type MediaResponse = StrapiData<MediaResponseEntity>
type Media = MediaResponseEntity & { id: number }

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
