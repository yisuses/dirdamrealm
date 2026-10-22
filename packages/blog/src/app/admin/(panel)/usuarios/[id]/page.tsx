import { notFound } from 'next/navigation'

import { UserForm } from '@blog/components/admin/users/UserForm'
import { requireAdminSession } from '@blog/core/auth/session'
import { isUuid } from '@blog/core/validation/uuid'
import { getUserForAdmin } from '@blog/db/queries/admin/users'

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = isUuid(id) ? await getUserForAdmin(id) : undefined
  if (!user) {
    notFound()
  }
  const session = await requireAdminSession()
  return <UserForm user={user} currentUserId={session.user?.id ?? ''} />
}
