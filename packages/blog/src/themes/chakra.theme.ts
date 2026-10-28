import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'
import { fieldAnatomy, tableAnatomy } from '@chakra-ui/react/anatomy'

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
    slotRecipes: {
      // Chakra sizes field hints and errors with a fixed small line height, which squashes them
      // when they are set larger or wrap onto a second line.
      field: {
        slots: fieldAnatomy.keys(),
        base: {
          helperText: { lineHeight: '1.5' },
          errorText: { lineHeight: '1.5' },
        },
      },
      // Chakra sets tables in tabular figures; Lora's tabular spaces and commas open wide gaps
      // between the words of every title.
      table: {
        slots: tableAnatomy.keys(),
        base: {
          root: { fontVariantNumeric: 'lining-nums' },
        },
      },
    },
  },
})

export const system = createSystem(defaultConfig, config)

export default system
