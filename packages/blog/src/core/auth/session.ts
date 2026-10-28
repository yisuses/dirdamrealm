import { redirect } from 'next/navigation'

import { auth, loginPath } from './config'

/** For admin pages and layouts: the session, or a redirect to the login page. */
export async function requireAdminSession() {
  const session = await auth()
  if (!session?.user) {
    redirect(loginPath)
  }
  return session
}
