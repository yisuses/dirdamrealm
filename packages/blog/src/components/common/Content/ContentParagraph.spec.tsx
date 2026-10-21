import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderWithProviders } from '@blog/test/render'

import { ContentParagraph } from './ContentParagraph'

describe('ContentParagraph', () => {
  it('should render the html text keeping bold and other tags', () => {
    const { container } = renderWithProviders(
      <ContentParagraph data={{ text: 'Plain <b>bold</b> and <a href="https://example.com/">link</a>' }} />,
    )

    expect(screen.getByText('bold').tagName).toBe('B')
    expect(screen.getByRole('link', { name: 'link' })).toHaveAttribute('href', 'https://example.com/')
    expect(container.firstChild).toHaveTextContent('Plain bold and link')
    expect(container.firstChild).toMatchSnapshot()
  })

  it('should render an empty paragraph without text', () => {
    const { container } = renderWithProviders(<ContentParagraph data={{ text: '' }} />)

    expect(container.firstChild).toBeEmptyDOMElement()
  })
})
