import type { ReactNode } from 'react'

import { AdminShell } from '@blog/components/admin/AdminShell/AdminShell'
import { requireAdminSession } from '@blog/core/auth/session'
import { dataSource } from '@blog/data'

/** Second layer of the admin's protection, after the proxy: every panel page needs a session. */
export default async function PanelLayout({ children }: { children: ReactNode }) {
  const session = await requireAdminSession()
  return (
    <AdminShell userName={session.user?.name ?? ''} dataSource={dataSource()}>
      {children}
    </AdminShell>
  )
}
