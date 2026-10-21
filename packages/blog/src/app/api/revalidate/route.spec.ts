/**
 * Route handlers run on the server and use the fetch API globals, which the default
 * jsdom environment does not provide.
 *
 * @jest-environment node
 */
import { revalidatePath } from 'next/cache'
import { after } from 'next/server'

import { getPostById } from '@blog/api'

import { POST, pathsToWarm } from './route'

jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }))
jest.mock('next/server', () => ({ after: jest.fn() }))
jest.mock('@sentry/nextjs', () => ({ captureException: jest.fn() }))
jest.mock('@blog/api', () => ({ getPostById: jest.fn() }))

const mockedRevalidatePath = revalidatePath as jest.MockedFunction<typeof revalidatePath>
const mockedAfter = after as jest.MockedFunction<typeof after>
const mockedGetPostById = getPostById as jest.MockedFunction<typeof getPostById>

const request = (secret?: string, body?: unknown) =>
  new Request('https://whemotion.com/api/revalidate', {
    method: 'POST',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    headers: secret === undefined ? {} : { 'x-revalidate-secret': secret },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

const publishedPost = { model: 'post', entry: { id: 42, publishedAt: '2026-10-20T11:30:00.000Z' } }

const post = (locale: AppLocales) =>
  ({
    id: 42,
    title: 'Hola Mundo',
    locale,
    categories: [{ code: 'TRAVEL', localizedName: 'Viajes y más' }],
  }) as Post

describe('POST /api/revalidate', () => {
  const originalSecret = process.env.REVALIDATE_SECRET

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.REVALIDATE_SECRET = 'expected-secret'
  })

  afterAll(() => {
    process.env.REVALIDATE_SECRET = originalSecret
  })

  it('should refuse to run when no secret is configured', async () => {
    delete process.env.REVALIDATE_SECRET

    const response = await POST(request('anything'))

    expect(response.status).toBe(503)
    expect(mockedRevalidatePath).not.toHaveBeenCalled()
    expect(mockedAfter).not.toHaveBeenCalled()
  })

  it('should tolerate whitespace around the configured secret', async () => {
    process.env.REVALIDATE_SECRET = '  expected-secret\n'

    const response = await POST(request('expected-secret'))

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ revalidated: true, at: expect.any(String) })
  })

  it('should refuse to run when the configured secret is only whitespace', async () => {
    process.env.REVALIDATE_SECRET = '   '

    const response = await POST(request('   '))

    expect(response.status).toBe(503)
    expect(mockedRevalidatePath).not.toHaveBeenCalled()
    expect(mockedAfter).not.toHaveBeenCalled()
  })

  it('should reject a request without the secret header', async () => {
    const response = await POST(request())

    expect(response.status).toBe(401)
    expect(mockedRevalidatePath).not.toHaveBeenCalled()
    expect(mockedAfter).not.toHaveBeenCalled()
  })

  it('should reject a wrong secret, including one that is only a prefix', async () => {
    expect((await POST(request('nope'))).status).toBe(401)
    expect((await POST(request('expected-secre'))).status).toBe(401)
    expect((await POST(request('expected-secretx'))).status).toBe(401)
    expect(mockedRevalidatePath).not.toHaveBeenCalled()
    expect(mockedAfter).not.toHaveBeenCalled()
  })

  it('should expire the content routes and the sitemaps on a valid request', async () => {
    const response = await POST(request('expected-secret'))

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ revalidated: true, at: expect.any(String) })

    expect(mockedRevalidatePath.mock.calls).toEqual([
      ['/[lng]', 'page'],
      ['/[lng]/archive', 'page'],
      ['/[lng]/category/[categoryCode]/[categoryName]', 'page'],
      ['/[lng]/post/[postId]/[postName]', 'page'],
      ['/sitemap.xml'],
      ['/sitemap/post.xml'],
      ['/sitemap/page.xml'],
      ['/sitemap/category.xml'],
    ])
  })

  it('should request the warmed pages after responding, tolerating failures', async () => {
    mockedGetPostById.mockResolvedValue(post('en'))
    const originalBaseUrl = process.env.BASE_URL
    process.env.BASE_URL = 'https://whemotion.com'
    const fetchSpy = jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(new Response())
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValue(new Response())

    const response = await POST(request('expected-secret', publishedPost))

    expect(response.status).toBe(200)
    expect(fetchSpy).not.toHaveBeenCalled()

    const [callback] = mockedAfter.mock.calls[0]
    await expect((callback as () => Promise<unknown>)()).resolves.toBeUndefined()

    expect(fetchSpy.mock.calls.map(([url]) => url)).toEqual([
      'https://whemotion.com/',
      'https://whemotion.com/archive/',
      'https://whemotion.com/en/',
      'https://whemotion.com/en/archive/',
      'https://whemotion.com/en/post/42/hola-mundo/',
      'https://whemotion.com/en/category/TRAVEL/viajes-y-mas/',
    ])

    fetchSpy.mockRestore()
    process.env.BASE_URL = originalBaseUrl
  })

  it('should still revalidate when the body is null', async () => {
    const response = await POST(request('expected-secret', null))

    expect(response.status).toBe(200)
    expect(mockedAfter).toHaveBeenCalledTimes(1)
  })

  it('should still revalidate when the body is not json', async () => {
    const response = await POST(
      new Request('https://whemotion.com/api/revalidate', {
        method: 'POST',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        headers: { 'x-revalidate-secret': 'expected-secret' },
        body: 'not json',
      }),
    )

    expect(response.status).toBe(200)
    expect(mockedRevalidatePath).toHaveBeenCalled()
    expect(mockedAfter).toHaveBeenCalledTimes(1)
  })
})

describe('pathsToWarm', () => {
  const listings = ['/', '/archive/', '/en/', '/en/archive/']

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should warm the home and the archive in every locale for any event', async () => {
    await expect(pathsToWarm({})).resolves.toEqual(listings)
    await expect(pathsToWarm({ model: 'writer', entry: { id: 3 } })).resolves.toEqual(listings)
  })

  it('should also warm a published post and its categories, without a prefix in the default locale', async () => {
    mockedGetPostById.mockResolvedValue(post('es'))

    await expect(pathsToWarm(publishedPost)).resolves.toEqual([
      ...listings,
      '/post/42/hola-mundo/',
      '/category/TRAVEL/viajes-y-mas/',
    ])
    expect(mockedGetPostById).toHaveBeenCalledWith({ id: 42 })
  })

  it('should not look up a draft post', async () => {
    await expect(pathsToWarm({ model: 'post', entry: { id: 42, publishedAt: null } })).resolves.toEqual(listings)
    expect(mockedGetPostById).not.toHaveBeenCalled()
  })

  it('should only warm the listings when the post cannot be found or fetched', async () => {
    mockedGetPostById.mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error('strapi down'))

    await expect(pathsToWarm(publishedPost)).resolves.toEqual(listings)
    await expect(pathsToWarm(publishedPost)).resolves.toEqual(listings)
  })

  it('should warm a category in every locale, falling back to its name without a translation', async () => {
    await expect(
      pathsToWarm({ model: 'category', entry: { code: 'TRAVEL', name: 'Viajes', translations: { en: 'Travel' } } }),
    ).resolves.toEqual([...listings, '/category/TRAVEL/viajes/', '/en/category/TRAVEL/travel/'])
  })
})
