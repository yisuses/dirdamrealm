/* eslint-disable @typescript-eslint/naming-convention -- Chakra's `_light`/`_dark` color conditions */
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
  // Reading text is set in the serif; controls and small print in the sans.
  globalCss: {
    'button, input, select, textarea, .chakra-button': { fontFamily: 'sans' },
  },
  theme: {
    breakpoints,
    tokens: {
      fonts: {
        body: { value: "'Newsreader', Georgia, serif" },
        heading: { value: "'Newsreader', Georgia, serif" },
        sans: { value: "'Inter', system-ui, sans-serif" },
      },
      colors: {
        gold: {
          50: { value: '#FBF7EE' },
          100: { value: '#F3EBD9' },
          200: { value: '#E6D4AE' },
          300: { value: '#D9B565' },
          400: { value: '#C49A45' },
          500: { value: '#9A7424' },
          600: { value: '#7F5F1D' },
          700: { value: '#634917' },
          800: { value: '#4A3611' },
          900: { value: '#2A2416' },
        },
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
    // The site's palette: a warm off-white page, near-black ink and one gold accent. Overriding
    // Chakra's own `bg`, `fg` and `border` tokens restyles every component that uses them.
    semanticTokens: {
      colors: {
        bg: {
          DEFAULT: { value: { _light: '#FAF8F4', _dark: '#121214' } },
          panel: { value: { _light: '#FFFFFF', _dark: '#1B1B1F' } },
          muted: { value: { _light: '#F2EFE8', _dark: '#202025' } },
        },
        fg: {
          DEFAULT: { value: { _light: '#17171B', _dark: '#ECEAE5' } },
          muted: { value: { _light: '#5F5E66', _dark: '#A3A1A9' } },
        },
        border: {
          DEFAULT: { value: { _light: '#E6E1D7', _dark: '#2C2C32' } },
        },
        accent: {
          DEFAULT: { value: { _light: '{colors.gold.500}', _dark: '{colors.gold.300}' } },
          soft: { value: { _light: '{colors.gold.100}', _dark: '{colors.gold.900}' } },
          contrast: { value: { _light: '#FFFFFF', _dark: '#121214' } },
        },
        // `colorPalette="gold"` on Chakra components.
        gold: {
          solid: { value: '{colors.accent}' },
          contrast: { value: '{colors.accent.contrast}' },
          fg: { value: { _light: '{colors.gold.600}', _dark: '{colors.gold.300}' } },
          muted: { value: { _light: '{colors.gold.100}', _dark: '{colors.gold.800}' } },
          subtle: { value: { _light: '{colors.gold.50}', _dark: '{colors.gold.900}' } },
          emphasized: { value: { _light: '{colors.gold.200}', _dark: '{colors.gold.700}' } },
          focusRing: { value: '{colors.accent}' },
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
