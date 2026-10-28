import { UserList } from '@blog/components/admin/users/UserList'
import { listUsersForAdmin } from '@blog/db/queries/admin/users'

export default async function UsersPage() {
  return <UserList users={await listUsersForAdmin()} />
}
