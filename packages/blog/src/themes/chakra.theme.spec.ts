import { describe, expect, it } from 'vitest'

import { breakpoints, system } from './chakra.theme'

describe('chakra theme', () => {
  it('should export the breakpoints', () => {
    expect(breakpoints).toEqual({ sm: '30em', md: '48em', lg: '62em', xl: '80em', '2xl': '96em' })
  })

  it('should register the custom fonts and colors as tokens', () => {
    expect(system.token('fonts.body')).toBe("'Newsreader', Georgia, serif")
    expect(system.token('fonts.heading')).toBe("'Newsreader', Georgia, serif")
    expect(system.token('fonts.sans')).toBe("'Inter', system-ui, sans-serif")
    expect(system.token('colors.gold.500')).toBe('#9A7424')
    expect(system.token('colors.gray.750')).toBe('#6C757D')
    expect(system.token('colors.transparent.500')).toBe('rgba(0,0,0,0.5)')
  })
})
