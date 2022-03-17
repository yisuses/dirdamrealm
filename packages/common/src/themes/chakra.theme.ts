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
  body: 'Lora, sans-serif',
  heading: 'Roboto, sans-serif',
}

const colors = {
  transparent: {
    '100': 'rgba(0,0,0,0.1)',
    '200': 'rgba(0,0,0,0.2)',
    '500': 'rgba(0,0,0,0.5)',
    full: 'transparent',
  },
  gray: {
    '50': '#E5E5E5',
    '800': '#343A40',
    '900': '#212529',
    '950': '#495057',
  },
}

const theme = extendTheme({
  breakpoints,
  colors,
  fonts,
}) as ThemeTypings

export default theme
