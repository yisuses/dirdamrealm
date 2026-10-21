import { describe, expect, it } from 'vitest'

import { formatPostDate } from './formatPostDate'

describe('formatPostDate', () => {
  it('should format an ISO date as dd.MM.yyyy', () => {
    expect(formatPostDate('2026-10-21T09:44:31.000Z')).toBe('21.10.2026')
  })

  it('should return the date part untouched when it is not a full date', () => {
    expect(formatPostDate('2026-10')).toBe('2026-10')
  })
})
