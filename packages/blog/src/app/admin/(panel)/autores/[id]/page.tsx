import { notFound } from 'next/navigation'

import { WriterForm } from '@blog/components/admin/writers/WriterForm'
import { isUuid } from '@blog/core/validation/uuid'
import { getWriterForAdmin, listUserOptions } from '@blog/db/queries/admin/writers'

export default async function EditWriterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const writer = isUuid(id) ? await getWriterForAdmin(id) : undefined
  if (!writer) {
    notFound()
  }
  return <WriterForm writer={writer} users={await listUserOptions()} />
}
