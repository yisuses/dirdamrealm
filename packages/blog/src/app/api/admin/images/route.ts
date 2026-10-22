import * as sentry from '@sentry/nextjs'

import { requireAuth } from '@blog/core/api/parseRequest'
import { listImages } from '@blog/core/cloudinary/library'

/** A page of the library: `?q=` filters by name, `?cursor=` continues from the previous page. */
export async function GET(request: Request) {
  const authResult = await requireAuth()
  if (!authResult.ok) {
    return authResult.response
  }
  const params = new URL(request.url).searchParams
  try {
    const page = await listImages({
      query: params.get('q')?.slice(0, 100) ?? '',
      cursor: params.get('cursor') ?? undefined,
    })
    return Response.json(page)
  } catch (error) {
    sentry.captureException(error)
    return Response.json({ error: 'No se han podido cargar las imágenes. Inténtalo de nuevo.' }, { status: 502 })
  }
}
