import { parseAuthRequest } from '@blog/core/api/parseRequest'
import { hashPassword } from '@blog/core/auth/passwords'
import { userUpdateSchema } from '@blog/core/validation/user'
import { isUuid } from '@blog/core/validation/uuid'
import { isEmailTaken, updateUser } from '@blog/db/queries/admin/users'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const parsed = await parseAuthRequest(request, userUpdateSchema)
  if (!parsed.ok) {
    return parsed.response
  }
  const { id } = await params
  const { name, email, active, password } = parsed.data
  if (!isUuid(id)) {
    return Response.json({ error: 'El usuario no existe' }, { status: 404 })
  }
  // Nobody can lock themselves out of the panel.
  if (!active && parsed.session.user?.id === id) {
    return Response.json({ error: 'No puedes desactivar tu propio usuario' }, { status: 409 })
  }
  if (await isEmailTaken(email, id)) {
    return Response.json({ error: 'Ya hay un usuario con ese email' }, { status: 409 })
  }
  const passwordHash = password ? await hashPassword(password) : undefined
  if (!(await updateUser(id, { name, email, active, ...(passwordHash && { passwordHash }) }))) {
    return Response.json({ error: 'El usuario no existe' }, { status: 404 })
  }
  return Response.json({ id })
}
