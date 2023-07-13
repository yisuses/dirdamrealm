import { mediaResponseEntity } from '@blog/api/media'

import { mediaMapper } from './mediaMapper'

describe('mediaMapper', () => {
  it('should map mediaEntity to Media correctly', () => {
    const expectedMedia = {
      id: 1,
      name: 'test image',
      alternativeText: 'test alt text',
      caption: 'test caption',
      width: 1000,
      height: 500,
      formats: {
        small: {
          ext: 'jpg',
          url: '/media/small_test.jpg',
          hash: 'testhash',
          mime: 'image/jpeg',
          name: 'small_test',
          path: null,
          size: 100,
          width: 500,
          height: 250,
        },
        medium: {
          ext: 'jpg',
          url: '/media/medium_test.jpg',
          hash: 'testhash',
          mime: 'image/jpeg',
          name: 'medium_test',
          path: null,
          size: 200,
          width: 750,
          height: 375,
        },
        large: {
          ext: 'jpg',
          hash: 'testhash',
          height: 675,
          mime: 'image/jpeg',
          name: 'large_test',
          path: null,
          size: 400,
          url: '/media/large_test.jpg',
          width: 1000,
        },
        thumbnail: {
          ext: 'jpg',
          hash: 'testhash',
          height: 25,
          mime: 'image/jpeg',
          name: 'thumbnail_test',
          path: null,
          size: 10,
          url: '/media/thumbnail_test.jpg',
          width: 15,
        },
      },
      hash: 'testhash',
      ext: 'jpg',
      mime: 'image/jpeg',
      size: 300,
      url: '/media/test.jpg',
      previewUrl: null,
      provider: 'provider',
      createdAt: '2022-04-01T12:00:00.000Z',
      updatedAt: '2022-04-01T12:00:00.000Z',
    }

    const mappedMedia = mediaMapper(mediaResponseEntity)

    expect(mappedMedia).toEqual(expectedMedia)
  })
})
