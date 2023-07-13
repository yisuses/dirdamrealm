import { shimmer } from '@blog/components'

import { toBase64 } from '../..'

export function buildBlurDataUrl(height: number, width: number) {
  return `data:image/svg+xml;base64,${toBase64(shimmer(height, width))}`
}
