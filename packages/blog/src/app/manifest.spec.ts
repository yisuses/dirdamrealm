import { describe, expect, it } from 'vitest'

import manifest from './manifest'

describe('manifest', () => {
  it('should name the site and point at its icons', () => {
    expect(manifest()).toMatchObject({
      name: 'White Emotion',
      start_url: '/',
      icons: [
        { src: '/icon.svg', type: 'image/svg+xml' },
        { src: '/apple-icon.png', sizes: '180x180' },
      ],
    })
  })
})
