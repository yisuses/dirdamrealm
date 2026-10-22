import { notFound } from 'next/navigation'

import { ImageForm } from '@blog/components/admin/images/ImageForm'
import { getImage } from '@blog/core/cloudinary/library'
import { isPublicId } from '@blog/core/validation/image'
import { findImageUsage } from '@blog/db/queries/admin/images'

export default async function EditImagePage({ params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = await params
  const image = isPublicId(publicId) ? await getImage(publicId) : undefined
  if (!image) {
    notFound()
  }
  return <ImageForm image={image} usage={await findImageUsage(publicId)} />
}
