import { postMock, postResponseMock } from '@api/post'
import { postMapper } from './postMapper'

describe('postMapper', () => {
  it('should return a valid Post when given valid input', () => {
    const result = postMapper(postResponseMock)

    expect(result).toEqual(postMock)
  })

  it('should return error if categories are malformed', () => {
    expect(() => {
      postMapper({
        ...postResponseMock,
        attributes: { ...postResponseMock.attributes, categories: { potato: 'wadus' } },
      } as unknown as StrapiDataItem<PostResponseEntity>)
    }).toThrowError()
  })
})
