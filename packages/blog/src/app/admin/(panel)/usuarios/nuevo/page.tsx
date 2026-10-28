import { UserForm } from '@blog/components/admin/users/UserForm'
import { requireAdminSession } from '@blog/core/auth/session'

export default async function NewUserPage() {
  const session = await requireAdminSession()
  return <UserForm currentUserId={session.user?.id ?? ''} />
}
