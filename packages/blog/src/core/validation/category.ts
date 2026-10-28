import { z } from 'zod'

const translation = z.object({
  name: z.string().trim().min(1, 'Escribe el nombre').max(60, 'Máximo 60 caracteres'),
  description: z.string().trim().max(500, 'Máximo 500 caracteres'),
})

/** A category as the panel edits it. Shared by the form and the API, so both validate the same. */
export const categorySchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^[A-Z]{1,16}$/, 'Solo letras mayúsculas sin tildes, de 1 a 16 (por ejemplo, VIAJES)'),
  main: z.boolean(),
  es: translation,
  en: translation,
})

export type CategoryInput = z.infer<typeof categorySchema>
