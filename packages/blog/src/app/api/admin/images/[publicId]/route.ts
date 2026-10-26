import * as sentry from '@sentry/nextjs'

import { parseAuthRequest, requireAuth } from '@blog/core/api/parseRequest'
import { deleteImage, getImage, updateImage } from '@blog/core/cloudinary/library'
import { imageMetaSchema, isPublicId } from '@blog/core/validation/image'
import { findImageUsage } from '@blog/db/queries/admin/images'

interface Context {
  params: Promise<{ publicId: string }>
}

const notFound = () => Response.json({ error: 'La imagen no existe' }, { status: 404 })

// Previews have their own copy of the database but share the real Cloudinary library: changing an
// image there could break the live site's posts, which that copy does not know about.
const previewRefusal = () =>
  process.env.VERCEL_ENV === 'preview'
    ? Response.json({ error: 'En la versión de prueba no se pueden borrar ni renombrar imágenes.' }, { status: 403 })
    : undefined
const cloudinaryFailed = (error: unknown) => {
  sentry.captureException(error)
  return Response.json({ error: 'Cloudinary no responde. Inténtalo de nuevo en un rato.' }, { status: 502 })
}

/** Renames the image or changes its description. Its address, and so every post using it, stays the same. */
export async function PATCH(request: Request, { params }: Context) {
  const parsed = await parseAuthRequest(request, imageMetaSchema)
  if (!parsed.ok) {
    return parsed.response
  }
  const refusal = previewRefusal()
  if (refusal) {
    return refusal
  }
  const { publicId } = await params
  try {
    if (!isPublicId(publicId) || !(await getImage(publicId))) {
      return notFound()
    }
    return Response.json(await updateImage(publicId, parsed.data))
  } catch (error) {
    return cloudinaryFailed(error)
  }
}

/** Only images no post uses can be deleted: the panel lists the posts to remove it from first. */
export async function DELETE(_request: Request, { params }: Context) {
  const authResult = await requireAuth()
  if (!authResult.ok) {
    return authResult.response
  }
  const refusal = previewRefusal()
  if (refusal) {
    return refusal
  }
  const { publicId } = await params
  if (!isPublicId(publicId)) {
    return notFound()
  }
  const usage = await findImageUsage(publicId)
  if (usage.length > 0) {
    return Response.json(
      { error: 'La imagen se usa en alguna entrada. Quítala de ellas antes de borrarla.', usage },
      { status: 409 },
    )
  }
  try {
    if (!(await getImage(publicId))) {
      return notFound()
    }
    await deleteImage(publicId)
  } catch (error) {
    return cloudinaryFailed(error)
  }
  return new Response(null, { status: 204 })
}
