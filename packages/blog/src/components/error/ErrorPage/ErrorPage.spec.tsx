import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { navigation } from '@blog/test/navigation'
import { renderWithProviders } from '@blog/test/render'

import { ErrorPage } from './ErrorPage'

describe('ErrorPage', () => {
  it('should render the generic error with a reload link by default', () => {
    const { container } = renderWithProviders(<ErrorPage />)

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Error')
    expect(screen.getByRole('link', { name: 'Recarga la página' })).toHaveAttribute('href', '/')
    expect(screen.getByText('Ups, algo no ha ido como debía...')).toBeInTheDocument()
    expect(container.firstChild).toMatchSnapshot()
  })

  it('should reload the page when the reload link is clicked', async () => {
    const user = userEvent.setup()
    const reload = vi.fn()
    const location = window.location
    vi.spyOn(window, 'location', 'get').mockReturnValue({ ...location, reload })
    renderWithProviders(<ErrorPage statusCode={500} />)

    await user.click(screen.getByRole('link', { name: 'Recarga la página' }))

    vi.restoreAllMocks()
    expect(reload).toHaveBeenCalledTimes(1)
  })

  it('should render the not found copy with a localized home link for a 404', () => {
    navigation.params = { lng: 'en' }
    const { container } = renderWithProviders(<ErrorPage statusCode={404} />, { lng: 'en' })

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Not found')
    expect(screen.getByRole('link', { name: 'Go to home page' })).toHaveAttribute('href', '/en/')
    expect(container.firstChild).toMatchSnapshot()
  })
})
