import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'

import { renderWithProviders } from '@blog/test/render'

import { CookieBanner } from './CookieBanner'

describe('CookieBanner', () => {
  afterEach(() => {
    document.cookie = 'wheblog-consent=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
    document.cookie = 'wheblog-consent-legacy=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
  })

  it('should show the consent message until it is accepted', async () => {
    const user = userEvent.setup()
    const { container } = renderWithProviders(<CookieBanner />)

    expect(
      screen.getByText('Emoción Blanca utiliza cookies para ofrecerte la mejor experiencia en nuestra web.'),
    ).toBeInTheDocument()
    expect(container.firstChild).toMatchSnapshot()

    await user.click(screen.getByRole('button', { name: 'Aceptar cookies' }))

    expect(screen.queryByText(/Emoción Blanca utiliza cookies/)).not.toBeInTheDocument()
    expect(document.cookie).toContain('wheblog-consent=true')
  })

  it('should not render once consent was given', () => {
    document.cookie = 'wheblog-consent=true; path=/'

    const { container } = renderWithProviders(<CookieBanner />)

    expect(container).toBeEmptyDOMElement()
  })
})
