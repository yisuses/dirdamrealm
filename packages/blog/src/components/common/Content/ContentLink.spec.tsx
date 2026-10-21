import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderWithProviders } from '@blog/test/render'

import { ContentLink } from './ContentLink'

describe('ContentLink', () => {
  it('should render a link card with image and description', () => {
    const { container } = renderWithProviders(
      <ContentLink
        data={{
          link: 'https://example.com/',
          meta: { title: 'Example', description: 'An example site', image: { url: 'https://example.com/a.png' } },
        }}
      />,
    )

    expect(screen.getByRole('link')).toHaveAttribute('href', 'https://example.com/')
    expect(screen.getByText('Example')).toBeInTheDocument()
    expect(screen.getByText('An example site')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Example' })).toHaveAttribute('src', 'https://example.com/a.png')
    expect(container.firstChild).toMatchSnapshot()
  })

  it('should render only the title without image or description', () => {
    renderWithProviders(<ContentLink data={{ link: 'https://example.com/', meta: { title: 'Example', image: {} } }} />)

    expect(screen.getByRole('link')).toHaveTextContent(/^Example$/)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })
})
