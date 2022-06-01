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
    if (media) {
      const preferredFormat = media.formats[format]
      if (preferredFormat) {
        return preferredFormat.url
      } else {
        //search for the following format available
        const nextAvailableFormatKeys = Object.keys(media.formats) as FormatType[]
        if (nextAvailableFormatKeys.length > 0) {
          let nextAvailableFormat: string | undefined
          nextAvailableFormatKeys.forEach(formatKey => {
            const nextAvailableFormatData = media.formats[formatKey]
            if (nextAvailableFormatData) {
              nextAvailableFormat = nextAvailableFormatData.url
            }
          })
          return nextAvailableFormat ? nextAvailableFormat : media.url
        } else {
          return media.url
        }
      }
    }
    return fallback || '/images/WElogo.png'
  } catch {
    console.error(`There was an error loading the image. ${media ? media.id : ''}, ${format}, ${fallback}`)
    return '/images/WElogo.png'
  }
}
