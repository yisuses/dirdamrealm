export type GetImageDataFromMediaParams = {
  media: Media | null
  format?: FormatType
}

export function getImageDataFromMedia({ media, format = 'large' }: GetImageDataFromMediaParams) {
  if (media && Object.keys(media.formats).includes(format)) {
    const preferredFormat = media.formats[format]
    return preferredFormat
  }
  return null
}

export type GetImageUrlFromMediaParams = GetImageDataFromMediaParams & {
  fallback?: string
}

export function getImageUrlFromMedia({
  media,
  format = 'large',
  fallback = '/images/WElogo.png',
}: GetImageUrlFromMediaParams) {
  try {
    if (!media) return fallback

    const preferredFormat = media.formats[format]
    if (preferredFormat) return preferredFormat.url

    //search for the following format available
    const nextAvailableFormatKeys = Object.keys(media.formats) as FormatType[]
    const nextAvailableFormat = nextAvailableFormatKeys.find(formatKey => media.formats[formatKey])
    if (!nextAvailableFormat) return media.url

    const nextAvailableFormatData = media.formats[nextAvailableFormat] as MediaFormat
    return nextAvailableFormatData.url
  } catch {
    console.error(
      `There was an error loading the image ID:"${
        media && typeof media === 'object' && 'id' in media ? media.id : 'unknown'
      }", FORMAT:"${format}", FALLBACK:"${fallback}"`,
    )
    return '/images/WElogo.png'
  }
}
