import type { ServerResponse } from 'http'

import { setCacheControl } from './setCacheControl'

const makeRes = () => ({ setHeader: jest.fn() } as unknown as ServerResponse)

describe('setCacheControl', () => {
  it('sets a public s-maxage + stale-while-revalidate policy with defaults', () => {
    const res = makeRes()

    setCacheControl(res)

    expect(res.setHeader).toHaveBeenCalledWith(
      'Cache-Control',
      'public, s-maxage=600, stale-while-revalidate=86400',
    )
  })

  it('honours custom values', () => {
    const res = makeRes()

    setCacheControl(res, { sMaxAge: 3600, staleWhileRevalidate: 60 })

    expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=60')
  })
})
