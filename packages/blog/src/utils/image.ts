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
  try {
    if (!media) return fallback || '/images/WElogo.png'

    const preferredFormat = media.formats[format]
    if (preferredFormat) return preferredFormat.url

    //search for the following format available
    const nextAvailableFormatKeys = Object.keys(media.formats) as FormatType[]
    const nextAvailableFormat = nextAvailableFormatKeys.find(formatKey => media.formats[formatKey])
    if (!nextAvailableFormat) return media.url

    const nextAvailableFormatData = media.formats[nextAvailableFormat]
    if (!nextAvailableFormatData) return media.url
    return nextAvailableFormatData.url
  } catch {
    console.error(`There was an error loading the image. ${media ? media.id : ''}, ${format}, ${fallback}`)
    return '/images/WElogo.png'
  }
}
