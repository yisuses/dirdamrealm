import { requireAuth } from '@blog/core/api/parseRequest'
import { fetchLinkPreview } from '@blog/core/linkPreview/linkPreview'

/**
 * The editor's link block asks here for a page's title, description and image, in the answer
 * shape the `@editorjs/link` tool expects.
 */
export async function GET(request: Request) {
  const authResult = await requireAuth()
  if (!authResult.ok) {
    return authResult.response
  }
  const url = new URL(request.url).searchParams.get('url') ?? ''
  const preview = await fetchLinkPreview(url).catch(() => undefined)
  if (!preview) {
    return Response.json({ success: 0 })
  }
  return Response.json({
    success: 1,
    link: url,
    meta: { title: preview.title, description: preview.description, image: { url: preview.image } },
  })
}
