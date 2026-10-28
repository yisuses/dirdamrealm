import { z } from 'zod'

import { parseAuthRequest } from '@blog/core/api/parseRequest'
import { localeSchema } from '@blog/core/validation/post'
import { createPost } from '@blog/db/queries/admin/posts'

/** A new, empty post in one language, signed by whoever creates it. */
export async function POST(request: Request) {
  const parsed = await parseAuthRequest(request, z.object({ locale: localeSchema }))
  if (!parsed.ok) {
    return parsed.response
  }
  const id = await createPost(parsed.data.locale, parsed.session.user!.id!)
  return Response.json({ id }, { status: 201 })
}
