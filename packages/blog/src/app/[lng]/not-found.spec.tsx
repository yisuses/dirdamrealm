import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderWithProviders } from '@blog/test/render'

import NotFound from './not-found'

describe('Locale not-found page', () => {
  it('should render the 404 page', () => {
    const { container } = renderWithProviders(<NotFound />)

    expect(screen.getByRole('link')).toHaveAttribute('href', '/')
    expect(container.firstChild).toMatchSnapshot()
  })
})
