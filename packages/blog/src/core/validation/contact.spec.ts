import { describe, expect, it } from 'vitest'

import { contactSchema } from './contact'

const link = (network: string, url = `https://${network}.com/whe`) => ({ network, handle: '', url, visible: true })
const valid = { display: true, name: 'Emoción Blanca', email: '', socialLinks: [link('twitter'), link('instagram')] }

describe('contactSchema', () => {
  it('should accept a contact block with an optional email and up to one link per network', () => {
    expect(contactSchema.safeParse(valid).success).toBe(true)
    expect(contactSchema.safeParse({ ...valid, email: 'hola@whemotion.com' }).success).toBe(true)
  })

  it('should reject a bad email, non-web addresses, unknown networks and repeated networks', () => {
    const messages = (input: unknown) => contactSchema.safeParse(input).error?.issues.map(issue => issue.message)

    expect(messages({ ...valid, email: 'hola' })).toEqual(['Escribe un email válido'])
    expect(messages({ ...valid, socialLinks: [link('twitter', 'ftp://x.com')] })).toEqual([
      'Escribe la dirección completa, empezando por https://',
    ])
    expect(contactSchema.safeParse({ ...valid, socialLinks: [link('myspace')] }).success).toBe(false)
    expect(messages({ ...valid, socialLinks: [link('twitter'), link('twitter')] })).toEqual([
      'Cada red solo puede aparecer una vez',
    ])
  })
})
