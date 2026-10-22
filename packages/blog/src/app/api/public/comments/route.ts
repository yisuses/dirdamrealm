import { getComments } from '@blog/data'

import { json, readParams } from '../params'

export async function GET(request: Request) {
  const { ids } = readParams(request)
  // Not cached: the post page refetches right after a visitor comments and must see it.
  return json(ids.length ? await getComments({ ids }) : [], { cache: false })
}
