/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unused-vars */
export const mediaMapper = (mediaEntity: StrapiDataItem<MediaResponseEntity>): Media => {
  const {
    id,
    attributes: { provider_metadata, ...mediaEntityAttributes },
  } = mediaEntity

  const mappedMediaFormatAttributes = Object.fromEntries<MediaFormat>(
    Object.entries(mediaEntityAttributes.formats).map(format => {
      const [formatType, formatAttributes] = format
      const { provider_metadata, ...tempFormatAttributes } = formatAttributes
      return [formatType, tempFormatAttributes]
    }),
  ) as Record<FormatType, MediaFormat>

  return { id, ...mediaEntityAttributes, formats: mappedMediaFormatAttributes }
}
