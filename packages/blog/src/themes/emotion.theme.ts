import { ConfigColorMode } from '@chakra-ui/color-mode'

import chakraTheme, { breakpoints } from './chakra.theme'

export function getUpMedia(size: keyof typeof breakpoints): string {
  return `(min-width: ${breakpoints[size]})`
}

export function getDownMedia(size: keyof typeof breakpoints): string {
  return `(max-width: ${breakpoints[size]})`
}

function getDownMediaQuery(size: keyof typeof breakpoints): string {
  return `@media ${getDownMedia(size)}`
}

function getUpMediaQuery(size: keyof typeof breakpoints): string {
  return `@media ${getUpMedia(size)}`
}

const theme = {
  ...chakraTheme,
  config: {
    initialColorMode: 'light' as ConfigColorMode,
  },
  media: {
    down: {
      sm: getDownMediaQuery('sm'),
      md: getDownMediaQuery('md'),
      lg: getDownMediaQuery('lg'),
      xl: getDownMediaQuery('xl'),
      '2xl': getDownMediaQuery('2xl'),
    },
    up: {
      sm: getUpMediaQuery('sm'),
      md: getUpMediaQuery('md'),
      lg: getUpMediaQuery('lg'),
      xl: getUpMediaQuery('xl'),
      '2xl': getUpMediaQuery('2xl'),
    },
  },
}

export type Theme = typeof theme
export default theme
