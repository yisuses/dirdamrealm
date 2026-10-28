import { resetPassword } from '@blog/core/auth/passwordReset'
import { hashPassword } from '@blog/core/auth/passwords'
import { passwordResetSchema } from '@blog/core/validation/user'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const parsed = passwordResetSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues }, { status: 400 })
  }
  const done = await resetPassword(parsed.data.token, await hashPassword(parsed.data.password))
  if (!done) {
    return Response.json(
      { error: 'El enlace ya no vale: ha caducado o ya se usó. Pide otro desde «¿Has olvidado la contraseña?».' },
      { status: 410 },
    )
  }
  return Response.json({ ok: true })
}
