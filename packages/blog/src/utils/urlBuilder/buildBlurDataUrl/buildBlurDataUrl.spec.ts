import { buildBlurDataUrl } from './buildBlurDataUrl'

describe('buildBlurDataUrl', () => {
  it('should build a blur data url correctly, given the sizes', () => {
    expect(buildBlurDataUrl(20, 30).startsWith('data:image/svg+xml;base64')).toBeTruthy()
  })
})
