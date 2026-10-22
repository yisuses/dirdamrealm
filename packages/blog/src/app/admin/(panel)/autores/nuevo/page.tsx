import { WriterForm } from '@blog/components/admin/writers/WriterForm'
import { listUserOptions } from '@blog/db/queries/admin/writers'

export default async function NewWriterPage() {
  return <WriterForm users={await listUserOptions()} />
}
