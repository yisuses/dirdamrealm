import { ResetPasswordForm } from '@blog/components/admin/auth/ResetPasswordForm'

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams
  return <ResetPasswordForm token={typeof token === 'string' ? token : undefined} />
}
