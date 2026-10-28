/* eslint-disable @typescript-eslint/naming-convention -- Cloudinary's answers keep their field names */
/** An image of the library as the panel shows it. */
export interface LibraryImage {
  publicId: string
  name: string
  alt: string
  width: number
  height: number
  format: string
  bytes: number
  createdAt: string
}

/** The fields the panel reads from Cloudinary's answers (search, Admin API and uploads). */
export interface CloudinaryResource {
  public_id: string
  width: number
  height: number
  format: string
  bytes: number
  created_at: string
  // Search returns the custom fields directly; the Admin API and uploads nest them under `custom`.
  context?: Record<string, string> & { custom?: Record<string, string> }
}

/** Images uploaded through Strapi have no name of their own: their id is the file name plus a hash. */
function nameFromPublicId(publicId: string) {
  return publicId.replace(/_[\da-f]{10}$/, '').replace(/[_-]+/g, ' ')
}

export function toLibraryImage(resource: CloudinaryResource): LibraryImage {
  const context = resource.context?.custom ?? resource.context ?? {}
  return {
    publicId: resource.public_id,
    name: context.name || nameFromPublicId(resource.public_id),
    alt: context.alt ?? '',
    width: resource.width,
    height: resource.height,
    format: resource.format,
    bytes: resource.bytes,
    createdAt: resource.created_at,
  }
}
