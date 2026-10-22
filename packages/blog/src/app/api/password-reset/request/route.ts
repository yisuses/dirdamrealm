import { createPasswordResetToken } from '@blog/core/auth/passwordReset'
import { passwordResetEmail } from '@blog/core/email/passwordResetEmail'
import { sendEmail } from '@blog/core/email/send'
import { passwordResetRatelimit } from '@blog/core/ratelimit'
import { passwordResetRequestSchema } from '@blog/core/validation/user'
import { getActiveUserByEmail } from '@blog/db/queries/users'
import { publicUrl } from '@blog/utils/generateUrl/generateUrl'

// The same answer whether or not the email has an account, so the form cannot be used to find out.
const sent = () => Response.json({ ok: true })

export async function POST(request: Request) {
  if (passwordResetRatelimit) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const { success } = await passwordResetRatelimit.limit(ip)
    if (!success) {
      return Response.json({ error: 'Demasiadas peticiones. Espera un rato y vuelve a probar.' }, { status: 429 })
    }
  }

  const body = await request.json().catch(() => null)
  const parsed = passwordResetRequestSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: 'Escribe un email válido' }, { status: 400 })
  }

  const user = await getActiveUserByEmail(parsed.data.email)
  if (!user) {
    return sent()
  }
  const token = await createPasswordResetToken(user.id)
  // The site's own address, never the request's Host, so a forged Host cannot steal the link.
  const link = publicUrl(`/admin/nueva-contrasena/?token=${token}`)
  await sendEmail({ to: user.email, ...passwordResetEmail({ name: user.name, link }) })
  return sent()
}
