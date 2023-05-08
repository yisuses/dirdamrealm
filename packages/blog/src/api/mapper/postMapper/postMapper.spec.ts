import { postMock, postResponseEnMock } from '@api/post'
import * as writerMapperModule from '../writterMapper/writerMapper'
import { postMapper } from './postMapper'

describe('postMapper', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should return a valid Post when given valid input', () => {
    expect(postMapper(postResponseEnMock)).toEqual(postMock)
  })

  it('should return error content is malformed', () => {
    jest.spyOn(JSON, 'parse').mockImplementation(() => {
      throw new Error('This is an error')
    })

    expect(() => {
      postMapper(postResponseEnMock)
    }).toThrowError()
  })

  it('should work if there are no categories', () => {
    expect(
      postMapper({
        ...postResponseEnMock,
        attributes: { ...postResponseEnMock.attributes, categories: null },
      } as unknown as StrapiDataItem<PostResponseEntity>),
    ).toEqual({ ...postMock, categories: null })
  })

  it('should return error if categories are malformed', () => {
    expect(() => {
      postMapper({
        ...postResponseEnMock,
        attributes: { ...postResponseEnMock.attributes, categories: { potato: 'wadus' } },
      } as unknown as StrapiDataItem<PostResponseEntity>)
    }).toThrowError()
  })

  it('should return error if localizations are malformed', () => {
    expect(() => {
      postMapper({
        ...postResponseEnMock,
        attributes: { ...postResponseEnMock.attributes, localizations: { potato: 'wadus' } },
      } as unknown as StrapiDataItem<PostResponseEntity>)
    }).toThrowError()
  })

  it('should work if coverImage data is empty', () => {
    expect(
      postMapper({
        ...postResponseEnMock,
        attributes: { ...postResponseEnMock.attributes, coverImage: { data: undefined } },
      } as unknown as StrapiDataItem<PostResponseEntity>),
    ).toEqual({ ...postMock, coverImage: null })
  })

  it('should return error if coverImage are malformed', () => {
    expect(() => {
      postMapper({
        ...postResponseEnMock,
        attributes: { ...postResponseEnMock.attributes, coverImage: { data: { potato: 'wadus' } } },
      } as unknown as StrapiDataItem<PostResponseEntity>)
    }).toThrowError()
  })

  it('should work if writter data is empty', () => {
    expect(
      postMapper({
        ...postResponseEnMock,
        attributes: { ...postResponseEnMock.attributes, writer: { data: undefined } },
      } as unknown as StrapiDataItem<PostResponseEntity>),
    ).toEqual({ ...postMock, writer: null })
  })

  it('should return error if writer are malformed', () => {
    jest.spyOn(writerMapperModule, 'writerMapper').mockImplementation(() => {
      throw new Error('This is an error')
    })
    expect(() => {
      postMapper({
        ...postResponseEnMock,
        attributes: { ...postResponseEnMock.attributes, writer: { data: { potato: 'wadus' } } },
      } as unknown as StrapiDataItem<PostResponseEntity>)
    }).toThrowError()
  })
})
