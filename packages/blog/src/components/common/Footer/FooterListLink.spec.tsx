import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderWithProviders } from '@blog/test/render'

import { FooterListLink } from './FooterListLink'

describe('FooterListLink', () => {
  it('should render a client-side link with its target', () => {
    const { container } = renderWithProviders(
      <FooterListLink href="/category/music/" target="_blank">
        Música
      </FooterListLink>,
    )

    const link = screen.getByRole('link', { name: 'Música' })
    expect(link).toHaveAttribute('href', '/category/music/')
    expect(link).toHaveAttribute('target', '_blank')
    expect(container.firstChild).toMatchSnapshot()
  })

  it('should render a plain anchor when forced', () => {
    const { container } = renderWithProviders(
      <FooterListLink href="mailto:hello@example.com" forceAnchor>
        Mail
      </FooterListLink>,
    )

    expect(screen.getByRole('link', { name: 'Mail' })).toHaveAttribute('href', 'mailto:hello@example.com')
    expect(container.firstChild).toMatchSnapshot()
  })
})
