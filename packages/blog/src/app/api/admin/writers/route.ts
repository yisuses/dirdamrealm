import { parseAuthRequest } from '@blog/core/api/parseRequest'
import { revalidatePublicContent } from '@blog/core/cache/revalidatePublicContent'
import { writerSchema } from '@blog/core/validation/writer'
import { createWriter, findWriterConflict } from '@blog/db/queries/admin/writers'

export async function POST(request: Request) {
  const parsed = await parseAuthRequest(request, writerSchema)
  if (!parsed.ok) {
    return parsed.response
  }
  const conflict = await findWriterConflict(parsed.data)
  if (conflict) {
    return Response.json({ error: conflict }, { status: 409 })
  }
  const id = await createWriter(parsed.data)
  revalidatePublicContent()
  return Response.json({ id }, { status: 201 })
}
