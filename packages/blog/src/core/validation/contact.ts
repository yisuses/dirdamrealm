import { z } from 'zod'

/** The networks the footer knows how to show, in the order it shows them by default. */
export const socialNetworks = ['twitter', 'facebook', 'instagram', 'linkedin'] as const

export const socialNetworkLabels: Record<(typeof socialNetworks)[number], string> = {
  twitter: 'Twitter / X',
  facebook: 'Facebook',
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
}

const socialLinkSchema = z.object({
  network: z.enum(socialNetworks),
  handle: z.string().trim().max(60, 'Máximo 60 caracteres'),
  url: z.url({ protocol: /^https?$/, error: 'Escribe la dirección completa, empezando por https://' }),
  visible: z.boolean(),
})

/** The footer's contact block and social links, as the panel edits them. */
export const contactSchema = z.object({
  display: z.boolean(),
  name: z.string().trim().max(80, 'Máximo 80 caracteres'),
  email: z.union([z.literal(''), z.email('Escribe un email válido')]),
  socialLinks: z
    .array(socialLinkSchema)
    .max(socialNetworks.length)
    .refine(links => new Set(links.map(link => link.network)).size === links.length, {
      error: 'Cada red solo puede aparecer una vez',
    }),
})

export type ContactInput = z.infer<typeof contactSchema>
