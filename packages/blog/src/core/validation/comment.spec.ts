import { describe, expect, it } from 'vitest'

import { commentSchema } from './comment'

const valid = { postId: 7, author: ' Ana María ', text: ' Un buen artículo ', captcha: 'token' }

describe('commentSchema', () => {
  it('should accept a comment with the form limits, trimmed', () => {
    expect(commentSchema.parse(valid)).toEqual({
      postId: 7,
      author: 'Ana María',
      text: 'Un buen artículo',
      captcha: 'token',
    })
  })

  it('should reject short or long names and texts, bad post ids and missing captchas', () => {
    for (const invalid of [
      { ...valid, author: 'Ana' },
      { ...valid, author: 'x'.repeat(41) },
      { ...valid, text: 'Hey' },
      { ...valid, text: 'x'.repeat(3001) },
      { ...valid, postId: 0 },
      { ...valid, postId: 1.5 },
      { ...valid, captcha: '' },
    ]) {
      expect(commentSchema.safeParse(invalid).success).toBe(false)
    }
  })
})
