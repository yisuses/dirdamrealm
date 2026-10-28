import { parseAuthRequest } from '@blog/core/api/parseRequest'
import { signUpload } from '@blog/core/cloudinary/library'
import { imageMetaSchema } from '@blog/core/validation/image'

/** Permission for the browser to upload one image, with this name and description, to Cloudinary. */
export async function POST(request: Request) {
  const parsed = await parseAuthRequest(request, imageMetaSchema)
  if (!parsed.ok) {
    return parsed.response
  }
  return Response.json(signUpload(parsed.data))
}
