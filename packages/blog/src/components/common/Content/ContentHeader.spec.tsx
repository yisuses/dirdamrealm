import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderWithProviders } from '@blog/test/render'

import { ContentHeader } from './ContentHeader'

describe('ContentHeader', () => {
  it('should render the html text as a heading', () => {
    const { container } = renderWithProviders(<ContentHeader data={{ text: 'Hello <i>world</i>' }} />)

    expect(screen.getByRole('heading', { name: 'Hello world' })).toBeInTheDocument()
    expect(screen.getByText('world').tagName).toBe('I')
    expect(container.firstChild).toMatchSnapshot()
  })

  it('should render an empty heading without text', () => {
    renderWithProviders(<ContentHeader data={{ text: '' }} />)

    expect(screen.getByRole('heading')).toBeEmptyDOMElement()
  })
})
