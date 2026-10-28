import { z } from 'zod'

const name = z.string().trim().min(1, 'Escribe el nombre').max(80, 'Máximo 80 caracteres')
// Cleaned before it is checked, so a pasted email with spaces or capitals is accepted.
const email = z.string().trim().toLowerCase().pipe(z.email('Escribe un email válido'))
export const password = z.string().min(10, 'Al menos 10 caracteres').max(200, 'Máximo 200 caracteres')

const matching = <T extends { password: string; passwordConfirm: string }>(value: T) =>
  value.password === value.passwordConfirm

const mismatch = { error: 'Las dos contraseñas no coinciden', path: ['passwordConfirm'] }

export const userCreateSchema = z
  .object({ name, email, password, passwordConfirm: z.string() })
  .refine(matching, mismatch)

/** Editing: an empty password keeps the current one. */
export const userUpdateSchema = z
  .object({
    name,
    email,
    active: z.boolean(),
    password: z.union([z.literal(''), password]),
    passwordConfirm: z.string(),
  })
  .refine(matching, mismatch)

export const passwordResetRequestSchema = z.object({ email })

export const passwordResetSchema = z
  .object({ token: z.string().min(1), password, passwordConfirm: z.string() })
  .refine(matching, mismatch)

export type UserCreateInput = z.infer<typeof userCreateSchema>
export type UserUpdateInput = z.infer<typeof userUpdateSchema>
