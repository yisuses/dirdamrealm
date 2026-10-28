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

/** Where a cropped image keeps its subject, as percentages from the top-left corner. */
type ImageFocus = { x: number; y: number }

/** `cover` fills its box and crops around the focus; `contain` shows the whole image. */
type ImageFit = 'cover' | 'contain'

type Media = {
  id: number
  name: string
  alternativeText: string
  caption: string
  width: number
  height: number
  formats: Record<FormatType, MediaFormat | undefined>
  hash: string
  ext: string
  mime: string
  size: number
  url: string
  previewUrl: string | null
  provider: string
  createdAt: string
  updatedAt: string
  focus?: ImageFocus
  fit?: ImageFit
}
