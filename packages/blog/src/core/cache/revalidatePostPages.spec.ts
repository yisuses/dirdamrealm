import { revalidatePath } from 'next/cache'
import { after } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { revalidatePostPages } from './revalidatePostPages'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('next/server', () => ({ after: vi.fn() }))

describe('revalidatePostPages', () => {
  const fetchMock = vi.fn<(url: string | URL) => Promise<Response>>(async () => new Response())

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://whemotion.com')
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
    vi.clearAllMocks()
  })

  it("should expire each language's page under its cached path and then visit its public url", async () => {
    revalidatePostPages([
      { number: 10, locale: 'es', title: 'Hola mundo' },
      { number: 11, locale: 'en', title: 'Hello world' },
    ])

    expect(vi.mocked(revalidatePath).mock.calls).toEqual([['/es/post/10/hola-mundo/'], ['/en/post/11/hello-world/']])
    expect(fetchMock).not.toHaveBeenCalled()

    await (vi.mocked(after).mock.calls[0]![0] as () => Promise<unknown>)()
    expect(fetchMock.mock.calls.map(([url]) => String(url))).toEqual([
      expect.stringMatching(/\/post\/10\/hola-mundo\/$/),
      expect.stringMatching(/\/en\/post\/11\/hello-world\/$/),
    ])
    expect(String(fetchMock.mock.calls[0]![0])).not.toContain('/es/')
  })
})
