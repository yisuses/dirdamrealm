import { WriterList } from '@blog/components/admin/writers/WriterList'
import { listWritersForAdmin } from '@blog/db/queries/admin/writers'

export default async function WritersPage() {
  return <WriterList writers={await listWritersForAdmin()} />
}
