'use server'

import { redirect } from 'next/navigation'

import { loginPath, signOut } from '@blog/core/auth/config'

export async function logout() {
  await signOut({ redirect: false })
  redirect(loginPath)
}
