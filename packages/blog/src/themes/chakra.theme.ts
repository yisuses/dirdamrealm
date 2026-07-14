import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'

export const breakpoints = {
  sm: '30em',
  md: '48em',
  lg: '62em',
  xl: '80em',
  '2xl': '96em',
}

const config = defineConfig({
  theme: {
    breakpoints,
    tokens: {
      fonts: {
        body: { value: 'Lora, sans-serif' },
        heading: { value: 'Roboto, sans-serif' },
      },
      colors: {
        transparent: {
          100: { value: 'rgba(0,0,0,0.1)' },
          200: { value: 'rgba(0,0,0,0.2)' },
          300: { value: 'rgba(0,0,0,0.3)' },
          400: { value: 'rgba(0,0,0,0.4)' },
          500: { value: 'rgba(0,0,0,0.5)' },
          600: { value: 'rgba(0,0,0,0.6)' },
          700: { value: 'rgba(0,0,0,0.7)' },
          800: { value: 'rgba(0,0,0,0.8)' },
          900: { value: 'rgba(0,0,0,0.9)' },
          full: { value: 'transparent' },
        },
        gray: {
          50: { value: '#E5E5E5' },
          750: { value: '#6C757D' },
          800: { value: '#343A40' },
          900: { value: '#212529' },
          950: { value: '#495057' },
        },
      },
    },
  },
})

export const system = createSystem(defaultConfig, config)

export default system
