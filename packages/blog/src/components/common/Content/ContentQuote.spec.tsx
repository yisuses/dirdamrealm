import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderWithProviders } from '@blog/test/render'

import { ContentQuote } from './ContentQuote'

describe('ContentQuote', () => {
  it('should render the quote with its caption', () => {
    const { container } = renderWithProviders(
      <ContentQuote data={{ text: 'To be <i>or not</i>', caption: 'Hamlet' }} />,
    )

    expect(container.querySelector('blockquote')).toHaveTextContent('To be or not')
    expect(screen.getByText('Hamlet').tagName).toBe('FOOTER')
    expect(container).toMatchSnapshot()
  })

  it('should render an empty quote without caption', () => {
    const { container } = renderWithProviders(<ContentQuote data={{ text: '' }} />)

    expect(container.querySelector('blockquote')).toBeEmptyDOMElement()
    expect(container.querySelector('footer')).not.toBeInTheDocument()
  })
})
