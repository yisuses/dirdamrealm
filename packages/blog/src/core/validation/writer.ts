import { z } from 'zod'

/** A writer's card as the panel edits it. */
export const writerSchema = z.object({
  name: z.string().trim().min(1, 'Escribe el nombre').max(80, 'Máximo 80 caracteres'),
  twitter: z.string().trim().max(60, 'Máximo 60 caracteres'),
  personalUrl: z.union([
    z.literal(''),
    z.url({ protocol: /^https?$/, error: 'Escribe la dirección completa, empezando por https://' }),
  ]),
  // The panel user this card belongs to, or '' for none.
  userId: z.union([z.literal(''), z.uuid()]),
})

export type WriterInput = z.infer<typeof writerSchema>
