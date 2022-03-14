import '@emotion/react'
import { Theme as EmotionTheme } from '@whe/common'

declare module '@emotion/react' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface Theme extends EmotionTheme {}
}
