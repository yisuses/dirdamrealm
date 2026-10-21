import { render, screen } from '@testing-library/react'
import { createInstance } from 'i18next'
import type { I18nProvider as NextI18nProvider } from 'next-i18next/client'
import type { ComponentProps } from 'react'
import { I18nextProvider, initReactI18next, useTranslation } from 'react-i18next'
import { describe, expect, it, vi } from 'vitest'

import { AppProviders } from './app-providers'

const i18nProviderProps = vi.hoisted(() => ({ current: undefined as unknown }))

vi.mock('@tanstack/react-query-devtools', () => ({ ReactQueryDevtools: () => null }))

// next-i18next/client imports `next/navigation` without an extension, which Node's ESM
// resolver rejects when the package is loaded unbundled, so stand in a plain i18next provider.
vi.mock('next-i18next/client', () => ({
  I18nProvider: (props: ComponentProps<typeof NextI18nProvider>) => {
    i18nProviderProps.current = props
    const i18n = createInstance()
    i18n.use(initReactI18next).init({ lng: props.language, resources: props.resources, initAsync: false })
    return <I18nextProvider i18n={i18n}>{props.children}</I18nextProvider>
  },
}))

const resources = {
  es: { common: { pageTitle: 'Hola' } },
  en: { common: { pageTitle: 'Hello' } },
}

function Greeting() {
  const { t, i18n } = useTranslation('common')
  return (
    <p>
      {i18n.language}: {t('pageTitle')}
    </p>
  )
}

describe('AppProviders', () => {
  it('should render the children translated in the given locale', () => {
    render(
      <AppProviders lng="en" resources={resources}>
        <Greeting />
      </AppProviders>,
    )

    expect(screen.getByText('en: Hello')).toMatchSnapshot()
  })

  it('should configure i18n with the app locales', () => {
    render(
      <AppProviders lng="es" resources={resources}>
        <Greeting />
      </AppProviders>,
    )

    expect(i18nProviderProps.current).toMatchObject({
      language: 'es',
      resources,
      supportedLngs: ['es', 'en'],
      defaultNS: 'common',
      fallbackLng: 'es',
    })
    expect(screen.getByText('es: Hola')).toBeInTheDocument()
  })
})
