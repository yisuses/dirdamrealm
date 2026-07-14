export const writerMapper = (writerEntity: StrapiDataItem<WriterResponseEntity>): Writer => {
  return { ...writerEntity }
}
