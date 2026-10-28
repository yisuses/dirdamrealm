import { searchPosts } from '@blog/data'

import { json, readParams } from '../params'

export async function GET(request: Request) {
  const { query } = readParams(request)
  return json(query.trim() ? await searchPosts({ query }) : [])
}
