import { describe, expect, it } from 'vitest'

import { shimmer } from './Shimmer'

describe('shimmer', () => {
  it('should build an svg sized to the given dimensions', () => {
    const svg = shimmer(280, 140)

    expect(svg).toContain('<svg width="280" height="140"')
    expect(svg).toContain('from="-280" to="280"')
    expect(svg).toMatchSnapshot()
  })
})
