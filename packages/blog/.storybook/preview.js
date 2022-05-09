import React, { Suspense } from 'react'
import { I18nextProvider } from 'react-i18next'
import '@fontsource/roboto'
import '@fontsource/lora'
import '@fontsource/spartan'

import theme from '../src/themes/emotion.theme'
import i18n from './i18next'

export const parameters = {
  i18n,
  locale: 'en',
  locales: {
    en: { title: 'English', right: 'EN' },
    es: { title: 'Spanish', right: 'ES' },
  },
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  chakra: { theme },
  layout: 'fullscreen',
}

export const decorators = [
  StoryFn => (
    <Suspense fallback={'Loading i18n...'}>
      <I18nextProvider i18n={i18n}>
        <StoryFn />
      </I18nextProvider>
    </Suspense>
  ),
]
