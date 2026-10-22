import * as sentry from '@sentry/nextjs'
import { type MockedFunction, beforeEach, describe, expect, it, vi } from 'vitest'

import { getPostById } from '@blog/data'

import Page from './page'

vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }))
vi.mock('@blog/data', () => ({ getPostById: vi.fn() }))

const mockedGetPostById = getPostById as MockedFunction<typeof getPostById>

const post = { id: 7, title: 'Hola Mundo', publishedAt: '2026-10-20T11:30:00.000Z' } as Post

const params = (lng: AppLocales, postId: string) => ({ params: Promise.resolve({ lng, postId }) })

const notFound = { digest: expect.stringMatching(/^NEXT_HTTP_ERROR_FALLBACK;404/) }
const redirectTo = (url: string) => ({ digest: expect.stringContaining(`NEXT_REDIRECT;replace;${url};`) })

describe('Post id page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedGetPostById.mockResolvedValue(post)
  })

  it('should 404 on a non-numeric post id', async () => {
    await expect(Page(params('es', 'abc'))).rejects.toMatchObject(notFound)
    expect(mockedGetPostById).not.toHaveBeenCalled()
  })

  it('should report a failed fetch and 404', async () => {
    const error = new Error('Strapi down')
    mockedGetPostById.mockRejectedValue(error)

    await expect(Page(params('es', '7'))).rejects.toMatchObject(notFound)
    expect(sentry.captureException).toHaveBeenCalledWith(error)
  })

  it('should 404 on an unpublished post', async () => {
    mockedGetPostById.mockResolvedValue({ ...post, publishedAt: '' })

    await expect(Page(params('es', '7'))).rejects.toMatchObject(notFound)
  })

  it('should redirect to the canonical url of the default locale', async () => {
    await expect(Page(params('es', '7'))).rejects.toMatchObject(redirectTo('/post/7/hola-mundo/'))
    expect(mockedGetPostById).toHaveBeenCalledWith({ id: 7 })
  })

  it('should redirect to the canonical url of a prefixed locale', async () => {
    await expect(Page(params('en', '7'))).rejects.toMatchObject(redirectTo('/en/post/7/hola-mundo/'))
  })
})
