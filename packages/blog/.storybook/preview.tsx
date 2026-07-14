import { ChakraProvider } from '@chakra-ui/react'
import { ThemeProvider as EmotionThemeProvider } from '@emotion/react'
import type { Preview } from '@storybook/nextjs'
import React, { Suspense } from 'react'
import { I18nextProvider } from 'react-i18next'
import '@fontsource/spartan'

import { ColorModeProvider } from '../src/components/ui/color-mode'
import system from '../src/themes/chakra.theme'
import emotionTheme from '../src/themes/emotion.theme'
import i18n from './i18next'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    layout: 'fullscreen',
  },
  decorators: [
    Story => (
      <ChakraProvider value={system}>
        <ColorModeProvider>
          <EmotionThemeProvider theme={emotionTheme}>
            <Suspense fallback={'Loading i18n...'}>
              <I18nextProvider i18n={i18n}>
                <Story />
              </I18nextProvider>
            </Suspense>
          </EmotionThemeProvider>
        </ColorModeProvider>
      </ChakraProvider>
    ),
  ],
}

export default preview
