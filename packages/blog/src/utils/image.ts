type GetImageDataFromMediaParams = {
  media: Media | null
  format?: FormatType
}

export function getImageDataFromMedia({ media, format = 'large' }: GetImageDataFromMediaParams) {
  return media ? media.formats[format] : null
}

type GetImageUrlFromMediaParams = GetImageDataFromMediaParams & {
  fallback?: string
}

export function getImageUrlFromMedia({
  media,
  format = 'large',
  fallback = '/images/WElogo.png',
}: GetImageUrlFromMediaParams) {
  return media ? media.formats[format].url : fallback || '/images/WElogo.png'
}
