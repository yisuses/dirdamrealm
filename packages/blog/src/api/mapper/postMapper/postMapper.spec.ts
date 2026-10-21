import * as sentry from '@sentry/nextjs'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { postMock, postResponseEnMock } from '@blog/api/post'

import * as categoryMapperModule from '../categorymapper/categoryMapper'
import * as writerMapperModule from '../writterMapper/writerMapper'
import { algoliaPostMapper, postMapper, safePostMapper } from './postMapper'

vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }))

describe('postMapper', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return a valid Post when given valid input', () => {
    expect(postMapper(postResponseEnMock)).toEqual(postMock)
  })

  it('should return error content is malformed', () => {
    vi.spyOn(JSON, 'parse').mockImplementation(() => {
      throw new Error('This is an error')
    })

    expect(() => {
      postMapper(postResponseEnMock)
    }).toThrow()
  })

  it('should work if there are no categories', () => {
    expect(
      postMapper({
        ...postResponseEnMock,
        categories: null,
      } as unknown as StrapiDataItem<PostResponseEntity>),
    ).toEqual({ ...postMock, categories: null })
  })

  it('should return error if categories are malformed', () => {
    expect(() => {
      postMapper({
        ...postResponseEnMock,
        categories: { potato: 'wadus' },
      } as unknown as StrapiDataItem<PostResponseEntity>)
    }).toThrow()
  })

  it('should return error if localizations are malformed', () => {
    expect(() => {
      postMapper({
        ...postResponseEnMock,
        localizations: { potato: 'wadus' },
      } as unknown as StrapiDataItem<PostResponseEntity>)
    }).toThrow()
  })

  it('should work if coverImage data is empty', () => {
    expect(
      postMapper({
        ...postResponseEnMock,
        coverImage: null,
      } as unknown as StrapiDataItem<PostResponseEntity>),
    ).toEqual({ ...postMock, coverImage: null })
  })

  it('should return error if coverImage are malformed', () => {
    expect(() => {
      postMapper({
        ...postResponseEnMock,
        coverImage: { potato: 'wadus' },
      } as unknown as StrapiDataItem<PostResponseEntity>)
    }).toThrow()
  })

  it('should work if writter data is empty', () => {
    expect(
      postMapper({
        ...postResponseEnMock,
        writer: null,
      } as unknown as StrapiDataItem<PostResponseEntity>),
    ).toEqual({ ...postMock, writer: null })
  })

  it('should return error if writer are malformed', () => {
    vi.spyOn(writerMapperModule, 'writerMapper').mockImplementation(() => {
      throw new Error('This is an error')
    })
    expect(() => {
      postMapper({
        ...postResponseEnMock,
        writer: { potato: 'wadus' },
      } as unknown as StrapiDataItem<PostResponseEntity>)
    }).toThrow()
  })
})

describe('safePostMapper', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should map a valid post', () => {
    expect(safePostMapper(postResponseEnMock)).toEqual(postMock)
  })

  it('should report a malformed post and skip it', () => {
    vi.spyOn(JSON, 'parse').mockImplementation(() => {
      throw new Error('This is an error')
    })

    expect(safePostMapper(postResponseEnMock)).toBeNull()
    expect(sentry.captureException).toHaveBeenCalled()
  })
})

describe('algoliaPostMapper', () => {
  const hit = {
    objectID: '7',
    title: 'Hola',
    summary: 'Resumen',
    imgUrl: 'https://example.com/a.png',
    publishedAt: '2026-10-20T10:00:00.000Z',
    createdAt: '2026-10-19T10:00:00.000Z',
    coverImageSourceUrl: '',
    locale: 'es',
    categories: [{ id: 1, code: 'ENG', name: 'Ingeniería', translations: { en: 'Engineering' } }],
  } as unknown as AlgoliaPostEntity

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should map a search hit to a post', () => {
    expect(algoliaPostMapper(hit)).toMatchObject({
      id: 7,
      title: 'Hola',
      imgUrl: 'https://example.com/a.png',
      localizations: null,
      categories: [{ code: 'ENG', localizedName: 'Ingeniería' }],
    })
  })

  it('should default a missing image and categories', () => {
    expect(
      algoliaPostMapper({ ...hit, imgUrl: undefined, categories: undefined } as unknown as AlgoliaPostEntity),
    ).toMatchObject({
      imgUrl: '',
      categories: null,
    })
  })

  it('should report malformed categories and fall back to none', () => {
    vi.spyOn(categoryMapperModule, 'algoliaCategoryMapper').mockImplementation(() => {
      throw new Error('bad category')
    })

    expect(algoliaPostMapper(hit).categories).toEqual([])
    expect(sentry.captureException).toHaveBeenCalledWith(expect.stringContaining('bad category'))
  })
})
