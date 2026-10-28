import { describe, expect, it, vi } from 'vitest'

import { GET, POST } from './route'

vi.mock('@blog/core/auth/handlers', () => ({ GET: 'get-handler', POST: 'post-handler' }))

describe('auth route', () => {
  it("should serve Auth.js's handlers", () => {
    expect(GET).toBe('get-handler')
    expect(POST).toBe('post-handler')
  })
})
