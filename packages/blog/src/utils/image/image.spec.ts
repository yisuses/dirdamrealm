import { getImageDataFromMedia, getImageUrlFromMedia } from './image'

const mockMedia: Media = {
  id: 1,
  name: 'Test media',
  alternativeText: 'Alternative text',
  caption: 'Media caption',
  width: 800,
  height: 600,
  formats: {
    small: {
      ext: 'png',
      path: null,
      url: 'http://test.com/images/small/test.png',
      hash: 'hashvalue',
      mime: 'image/png',
      name: 'test_small',
      size: 1234,
      width: 100,
      height: 75,
    },
    medium: {
      ext: 'png',
      path: 'path',
      url: 'http://test.com/images/medium/test.png',
      hash: 'hashvalue',
      mime: 'image/png',
      name: 'test_medium',
      size: 5678,
      width: 400,
      height: 300,
    },
    large: {
      ext: 'png',
      path: 'path',
      url: 'http://test.com/images/large/test.png',
      hash: 'hashvalue',
      mime: 'image/png',
      name: 'test_large',
      size: 9012,
      width: 800,
      height: 600,
    },
    thumbnail: undefined,
  },
  hash: 'hashvalue',
  ext: 'png',
  mime: 'image/png',
  size: 9012,
  url: 'http://test.com/images/test.png',
  previewUrl: null,
  provider: 'test provider',
  createdAt: '2022-03-25T11:45:00.000Z',
  updatedAt: '2022-03-25T11:45:00.000Z',
}

const mockImageData: MediaFormat = {
  ext: '',
  url: '',
  hash: '',
  mime: '',
  name: '',
  path: '',
  size: 0,
  width: 0,
  height: 0,
}

describe('getImageDataFromMedia', () => {
  it('should return null if media is null', () => {
    const imageData = getImageDataFromMedia({ media: null })
    expect(imageData).toBeNull()
  })

  it('should return default format if media has no matching format', () => {
    const imageData = getImageDataFromMedia({ media: mockMedia, format: 'extra_large' as FormatType })
    expect(imageData).toBeNull()
  })

  it('should return format data if media has matching format', () => {
    const imageData = getImageDataFromMedia({ media: mockMedia, format: 'small' })
    expect(imageData).toEqual({
      ext: 'png',
      path: null,
      url: 'http://test.com/images/small/test.png',
      hash: 'hashvalue',
      mime: 'image/png',
      name: 'test_small',
      size: 1234,
      width: 100,
      height: 75,
    })
  })
})

describe('getImageUrlFromMedia', () => {
  it('returns fallback when media is null and fallback is provided', () => {
    const result = getImageUrlFromMedia({ media: null, fallback: 'http://example.com/fallback.jpg' })
    expect(result).toEqual('http://example.com/fallback.jpg')
  })

  it('returns fallback when media is null and no fallback is provided', () => {
    const result = getImageUrlFromMedia({ media: null })
    expect(result).toEqual('/images/WElogo.png')
  })

  it('returns default fallback when media is null and fallback is not provided', () => {
    const result = getImageUrlFromMedia({ media: null })
    expect(result).toEqual('/images/WElogo.png')
  })

  it('returns url of the preferred format when available', () => {
    const result = getImageUrlFromMedia({ media: mockMedia, format: 'large' })
    expect(result).toEqual('http://test.com/images/large/test.png')
  })

  it('returns url of the next available format when preferred format is not available', () => {
    const result = getImageUrlFromMedia({ media: mockMedia, format: 'thumbnail' })
    expect(result).toEqual('http://test.com/images/small/test.png')
  })

  it('returns original url when no format is available', () => {
    const result = getImageUrlFromMedia({
      media: { ...mockMedia, formats: { small: undefined, medium: undefined, large: undefined, thumbnail: undefined } },
      format: 'unknown' as FormatType,
    })
    expect(result).toEqual('http://test.com/images/test.png')
  })

  it('returns fallback when there is an error loading the image and fallback is provided', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => 0)
    const result = getImageUrlFromMedia({
      media: { id: 2 } as unknown as Media,
      fallback: 'http://example.com/fallback.jpg',
    })
    expect(consoleSpy).toHaveBeenCalledWith(
      'There was an error loading the image ID:"2", FORMAT:"large", FALLBACK:"http://example.com/fallback.jpg"',
    )
    expect(result).toEqual('/images/WElogo.png')
    consoleSpy.mockRestore()
  })

  it('returns fallback when there is an error loading the image and fallback is provided and unsupported format', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => 0)
    const result = getImageUrlFromMedia({ media: 'a' as unknown as Media, fallback: 'http://example.com/fallback.jpg' })
    expect(consoleSpy).toHaveBeenCalledWith(
      'There was an error loading the image ID:"unknown", FORMAT:"large", FALLBACK:"http://example.com/fallback.jpg"',
    )
    expect(result).toEqual('/images/WElogo.png')
    consoleSpy.mockRestore()
  })

  it('returns default fallback when there is an error loading the image and fallback is not provided', () => {
    const result = getImageUrlFromMedia({ media: null })

    expect(result).toBe('/images/WElogo.png')
  })

  it('returns preferred format url when available', () => {
    mockMedia.formats.large = mockImageData

    const result = getImageUrlFromMedia({ media: mockMedia })

    expect(result).toBe('')
  })

  it('returns url of first available format when preferred format is not available', () => {
    mockMedia.formats.thumbnail = mockImageData

    const result = getImageUrlFromMedia({ media: mockMedia, format: 'large' })

    expect(result).toBe('')
  })
})
