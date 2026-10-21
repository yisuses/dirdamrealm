import { describe, expect, it } from 'vitest'

import theme, { getDownMedia, getUpMedia } from './emotion.theme'

describe('emotion theme', () => {
  it('should build min-width media features from the chakra breakpoints', () => {
    expect(getUpMedia('md')).toBe('(min-width: 48em)')
  })

  it('should build max-width media features from the chakra breakpoints', () => {
    expect(getDownMedia('lg')).toBe('(max-width: 62em)')
  })

  it('should expose up and down media queries for every breakpoint', () => {
    expect(theme).toMatchSnapshot()
  })
})
