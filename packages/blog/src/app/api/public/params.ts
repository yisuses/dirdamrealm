import { isAppLocale } from '@blog/core/i18n/config'

/** Query-string readers for the public read endpoints: anything unexpected is ignored. */
export function readParams(request: Request) {
  const params = new URL(request.url).searchParams
  const locale = params.get('locale') ?? undefined
  const category = params.get('category') ?? params.get('code') ?? undefined
  const limit = Number(params.get('limit'))
  return {
    locale: isAppLocale(locale) ? locale : undefined,
    category: category && /^[A-Z]{1,16}$/.test(category) ? category : undefined,
    limit: Number.isInteger(limit) && limit > 0 && limit <= 100 ? limit : undefined,
    ids: (params.get('ids') ?? '')
      .split(',')
      .map(Number)
      .filter(id => Number.isInteger(id) && id > 0)
      .slice(0, 20),
    query: (params.get('q') ?? '').slice(0, 100),
  }
}

// Shared by the CDN for a few minutes and served stale while it refreshes, so a burst of
// visitors costs one function call, not one each.
// eslint-disable-next-line @typescript-eslint/naming-convention
const cached = { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=86400' }

export function json(data: unknown, { cache = true } = {}) {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  return Response.json(data, { headers: cache ? cached : { 'Cache-Control': 'no-store' } })
}
