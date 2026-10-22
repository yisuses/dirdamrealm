import { parseAuthRequest } from '@blog/core/api/parseRequest'
import { revalidatePublicContent } from '@blog/core/cache/revalidatePublicContent'
import { contactSchema } from '@blog/core/validation/contact'
import { saveContact } from '@blog/db/queries/admin/contact'

export async function PUT(request: Request) {
  const parsed = await parseAuthRequest(request, contactSchema)
  if (!parsed.ok) {
    return parsed.response
  }
  await saveContact(parsed.data)
  // The contact block and the social links are in every page's footer.
  revalidatePublicContent()
  return new Response(null, { status: 204 })
}
