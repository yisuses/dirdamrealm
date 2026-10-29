import { screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { renderWithProviders } from '@blog/test/render'

import { Footer, type FooterProps } from './Footer'

const categories: FooterProps['categories'] = [
  { name: 'Music', localizedName: 'Música', url: '/category/music/', code: 'music' },
  { name: 'Cinema', localizedName: 'Cine', url: '/category/cinema/', code: 'cinema' },
]

const about: About = {
  id: 1,
  display: true,
  name: 'White Emotion',
  email: 'hello@example.com',
  twitterUrl: 'https://twitter.com/we',
  facebookUrl: 'https://facebook.com/we',
  instagramUrl: 'https://instagram.com/we',
  linkedinUrl: 'https://linkedin.com/we',
  createdAt: '2022-04-01T00:00:00.000Z',
  updatedAt: '2022-04-01T00:00:00.000Z',
  locale: 'es',
}

describe('Footer', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2024-06-01T00:00:00.000Z'))
    vi.stubEnv('APP_VERSION', '1.2.3')
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllEnvs()
  })

  it('should render the brand, categories, contact and socials', () => {
    const { container } = renderWithProviders(<Footer categories={categories} about={about} />)

    expect(screen.getByRole('link', { name: 'Logotipo de White Emotion' })).toHaveAttribute('href', '/')
    expect(
      screen.getByText('Deporte, música, actualidad y viajes contados con emoción. Escrito por White Emotion.'),
    ).toBeInTheDocument()
    expect(screen.getByText('Contacto')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Enviar un correo electrónico' })).toHaveAttribute(
      'href',
      'mailto:hello@example.com',
    )
    expect(screen.getByRole('link', { name: 'Música' })).toHaveAttribute('href', '/category/music/')
    expect(screen.getByRole('link', { name: 'Cine' })).toHaveAttribute('href', '/category/cinema/')
    expect(screen.getByRole('link', { name: 'Archivo' })).toHaveAttribute('href', '/archive/')
    for (const [label, href] of [
      ['X', about.twitterUrl],
      ['Facebook', about.facebookUrl],
      ['Instagram', about.instagramUrl],
      ['Linkedin', about.linkedinUrl],
    ]) {
      expect(screen.getByRole('link', { name: label })).toHaveAttribute('href', href)
    }
    expect(screen.getByText('© 2024 White Emotion.')).toBeInTheDocument()
    expect(screen.getByText('Versión 1.2.3')).toBeInTheDocument()
    expect(container.firstChild).toMatchSnapshot()
  })

  it('should leave out the contact column, the signature and socials when about is hidden', () => {
    const { container } = renderWithProviders(<Footer categories={categories} about={{ ...about, display: false }} />)

    expect(screen.queryByText('Contacto')).not.toBeInTheDocument()
    expect(screen.getByText('Deporte, música, actualidad y viajes contados con emoción')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'X' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Música' })).toBeInTheDocument()
    expect(container.firstChild).toMatchSnapshot()
  })

  it('should skip the name, email and socials that are missing', () => {
    renderWithProviders(
      <Footer
        categories={[]}
        about={{ ...about, name: undefined, email: undefined, facebookUrl: undefined, linkedinUrl: undefined }}
      />,
    )

    expect(screen.getByText('Contacto')).toBeInTheDocument()
    expect(screen.getByText('Deporte, música, actualidad y viajes contados con emoción')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Enviar un correo electrónico' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'X' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Instagram' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Facebook' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Linkedin' })).not.toBeInTheDocument()
  })

  it('should render no social links when about has none', () => {
    renderWithProviders(
      <Footer
        categories={categories}
        about={{
          ...about,
          twitterUrl: undefined,
          facebookUrl: undefined,
          instagramUrl: undefined,
          linkedinUrl: undefined,
        }}
      />,
    )

    for (const label of ['X', 'Facebook', 'Instagram', 'Linkedin']) {
      expect(screen.queryByRole('link', { name: label })).not.toBeInTheDocument()
    }
  })
})
