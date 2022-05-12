/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unused-vars */
export const mediaMapper = (mediaEntity: StrapiDataItem<MediaResponseEntity>): Media => {
  const {
    id,
    attributes: { provider_metadata, ...mediaEntityAttributes },
  } = mediaEntity

  return { id, ...mediaEntityAttributes }
}
