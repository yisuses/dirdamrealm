import { screen, within } from '@testing-library/react'
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

  it('should render contact, categories, socials and credits', () => {
    const { container } = renderWithProviders(<Footer categories={categories} about={about} />)

    expect(screen.getByText('Contacto')).toBeInTheDocument()
    expect(screen.getByText('White Emotion')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Enviar un correo electrónico' })).toHaveAttribute(
      'href',
      'mailto:hello@example.com',
    )
    expect(screen.getByRole('link', { name: 'Música' })).toHaveAttribute('href', '/category/music/')
    expect(screen.getByRole('link', { name: 'Cine' })).toHaveAttribute('href', '/category/cinema/')
    expect(screen.getByText('En otros medios')).toBeInTheDocument()
    for (const [label, href] of [
      ['Twitter', about.twitterUrl],
      ['Facebook', about.facebookUrl],
      ['Instagram', about.instagramUrl],
      ['Linkedin', about.linkedinUrl],
    ]) {
      expect(screen.getByRole('link', { name: label })).toHaveAttribute('href', href)
    }
    expect(screen.getByText('© 2024 White Emotion.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'SimpleSmart' })).toHaveAttribute(
      'href',
      'https://www.figma.com/community/file/1036294505314600437',
    )
    expect(screen.getByText('Versión 1.2.3')).toBeInTheDocument()
    expect(container.firstChild).toMatchSnapshot()
  })

  it('should leave out the contact column and socials when about is hidden', () => {
    const { container } = renderWithProviders(<Footer categories={categories} about={{ ...about, display: false }} />)

    expect(screen.queryByText('Contacto')).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Twitter' })).not.toBeInTheDocument()
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
    expect(screen.queryByText('White Emotion')).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Enviar un correo electrónico' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Twitter' })).toBeInTheDocument()
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

    const otherMedia = screen.getByText('En otros medios').parentElement!
    expect(within(otherMedia).queryByRole('link')).not.toBeInTheDocument()
  })
})
