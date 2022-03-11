import { extendTheme } from '@chakra-ui/react'
import { ThemeTypings } from '@chakra-ui/styled-system'

export const breakpoints = {
  sm: '30em',
  md: '48em',
  lg: '62em',
  xl: '80em',
  '2xl': '96em',
}

const fonts = {
  body: 'Roboto, sans-serif',
  heading: 'Roboto, sans-serif',
}

const theme = extendTheme({
  breakpoints,
  fonts,
}) as ThemeTypings

export default theme
