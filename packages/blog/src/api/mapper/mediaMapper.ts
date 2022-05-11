export const mediaMapper = (mediaEntity: StrapiDataItem<MediaResponseEntity>): Media => {
  return { id: mediaEntity.id, ...mediaEntity.attributes }
}
