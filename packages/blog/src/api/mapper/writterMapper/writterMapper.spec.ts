import { writerMapper } from './writerMapper'

describe('writerMapper', () => {
  it('should map a writerEntity correctly', () => {
    const writerEntity: StrapiDataItem<WriterResponseEntity> = {
      id: 1,
      attributes: {
        name: 'John Doe',
        createdAt: '2022-01-01T00:00:00.000Z',
        updatedAt: '2022-01-02T00:00:00.000Z',
        avatar: 'https://example.com/avatar.png',
        twitter: '@johndoe',
        personalUrl: 'https://example.com/johndoe',
      },
    }
    const expectedWriter: Writer = {
      id: 1,
      name: 'John Doe',
      createdAt: '2022-01-01T00:00:00.000Z',
      updatedAt: '2022-01-02T00:00:00.000Z',
      avatar: 'https://example.com/avatar.png',
      twitter: '@johndoe',
      personalUrl: 'https://example.com/johndoe',
    }
    const result = writerMapper(writerEntity)
    expect(result).toEqual(expectedWriter)
  })
})
