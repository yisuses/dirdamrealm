import { getLatestPosts } from '@blog/data'

import { json, readParams } from '../../params'

export async function GET(request: Request) {
  const { locale, category, limit } = readParams(request)
  return json(await getLatestPosts({ locale, category, limit }))
}
