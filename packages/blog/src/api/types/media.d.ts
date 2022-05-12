/* eslint-disable @typescript-eslint/naming-convention */
type MediaFormatResponseEntity = {
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
type FormatType = 'small' | 'medium' | 'large' | 'thumbnail'
type MediaFormat = Omit<MediaFormatResponseEntity, 'provider_metadata'>

type MediaResponseEntity = {
  name: string
  alternativeText: string
  caption: string
  width: number
  height: number
  formats: Record<FormatType, MediaFormatResponseEntity>
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

type Media = {
  id: number
  name: string
  alternativeText: string
  caption: string
  width: number
  height: number
  formats: Record<FormatType, MediaFormat>
  hash: string
  ext: string
  mime: string
  size: number
  url: string
  previewUrl: string | null
  provider: string
  createdAt: string
  updatedAt: string
}
