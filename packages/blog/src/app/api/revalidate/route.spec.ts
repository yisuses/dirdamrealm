/**
 * Route handlers run on the server and use the fetch API globals, which the default
 * jsdom environment does not provide.
 *
 * @jest-environment node
 */
import { revalidatePath } from 'next/cache'

import { POST } from './route'

jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }))
jest.mock('@sentry/nextjs', () => ({ captureException: jest.fn() }))

const mockedRevalidatePath = revalidatePath as jest.MockedFunction<typeof revalidatePath>

const request = (secret?: string) =>
  new Request('https://whemotion.com/api/revalidate', {
    method: 'POST',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    headers: secret === undefined ? {} : { 'x-revalidate-secret': secret },
  })

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

    const response = POST(request('anything'))

    expect(response.status).toBe(503)
    expect(mockedRevalidatePath).not.toHaveBeenCalled()
  })

  it('should tolerate whitespace around the configured secret', async () => {
    process.env.REVALIDATE_SECRET = '  expected-secret\n'

    const response = POST(request('expected-secret'))

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ revalidated: true, at: expect.any(String) })
  })

  it('should refuse to run when the configured secret is only whitespace', () => {
    process.env.REVALIDATE_SECRET = '   '

    const response = POST(request('   '))

    expect(response.status).toBe(503)
    expect(mockedRevalidatePath).not.toHaveBeenCalled()
  })

  it('should reject a request without the secret header', () => {
    const response = POST(request())

    expect(response.status).toBe(401)
    expect(mockedRevalidatePath).not.toHaveBeenCalled()
  })

  it('should reject a wrong secret, including one that is only a prefix', () => {
    expect(POST(request('nope')).status).toBe(401)
    expect(POST(request('expected-secre')).status).toBe(401)
    expect(POST(request('expected-secretx')).status).toBe(401)
    expect(mockedRevalidatePath).not.toHaveBeenCalled()
  })

  it('should expire the content routes and the sitemaps on a valid request', async () => {
    const response = POST(request('expected-secret'))

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
})
