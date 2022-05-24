export const writerMapper = (writerEntity: StrapiDataItem<WriterResponseEntity>): Writer => {
  return { id: writerEntity.id, ...writerEntity.attributes }
}
