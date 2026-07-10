/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unused-vars */
export const mediaMapper = (mediaEntity: StrapiDataItem<MediaResponseEntity>): Media => {
  const { provider_metadata, formats, ...mediaEntityAttributes } = mediaEntity

  const mappedMediaFormatAttributes = Object.fromEntries<MediaFormat>(
    Object.entries(formats).map(format => {
      const [formatType, formatAttributes] = format
      const { provider_metadata, ...tempFormatAttributes } = formatAttributes
      return [formatType, tempFormatAttributes]
    }),
  ) as Record<FormatType, MediaFormat>

  return { ...mediaEntityAttributes, formats: mappedMediaFormatAttributes }
}
