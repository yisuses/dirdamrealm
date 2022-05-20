type GetImageUrlFromMediaParams = {
  media: Media | null
  format?: FormatType
  fallback?: string
}

export function getImageUrlFromMedia({
  media,
  format = 'large',
  fallback = 'https://picsum.photos/1440/600',
}: GetImageUrlFromMediaParams) {
  return media ? media.formats[format].url : fallback
}
