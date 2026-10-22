import { getAllPosts } from '@blog/data'

import { json, readParams } from '../params'

export async function GET(request: Request) {
  const { locale, category } = readParams(request)
  return json(await getAllPosts({ locale, category }))
}
