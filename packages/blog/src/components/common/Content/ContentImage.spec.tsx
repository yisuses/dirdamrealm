import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderWithProviders } from '@blog/test/render'

import { ContentImage } from './ContentImage'

const file = { url: '/media/test.jpg', width: 100, height: 50 } as Media

describe('ContentImage', () => {
  it('should render the image with its caption', () => {
    const { container } = renderWithProviders(<ContentImage data={{ caption: 'A caption', file }} />)

    const image = screen.getByRole('img', { name: 'A caption' })
    expect(image).toHaveAttribute('src', '/media/test.jpg')
    expect(image).toHaveAttribute('width', '100')
    expect(image).toHaveAttribute('height', '50')
    expect(screen.getByText('A caption')).toBeInTheDocument()
    expect(container.firstChild).toMatchSnapshot()
  })

  it('should fall back to a generic alt text without caption', () => {
    renderWithProviders(<ContentImage data={{ file }} />)

    expect(screen.getByRole('img', { name: 'image caption' })).toBeInTheDocument()
  })
})
