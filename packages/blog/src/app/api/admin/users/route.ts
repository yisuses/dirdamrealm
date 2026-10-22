import { parseAuthRequest } from '@blog/core/api/parseRequest'
import { hashPassword } from '@blog/core/auth/passwords'
import { userCreateSchema } from '@blog/core/validation/user'
import { createUser, isEmailTaken } from '@blog/db/queries/admin/users'

export async function POST(request: Request) {
  const parsed = await parseAuthRequest(request, userCreateSchema)
  if (!parsed.ok) {
    return parsed.response
  }
  const { name, email, password } = parsed.data
  if (await isEmailTaken(email)) {
    return Response.json({ error: 'Ya hay un usuario con ese email' }, { status: 409 })
  }
  const id = await createUser({ name, email, passwordHash: await hashPassword(password) })
  return Response.json({ id }, { status: 201 })
}
