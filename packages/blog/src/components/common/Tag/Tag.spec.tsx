import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderWithProviders } from '@blog/test/render'

import { Tag } from './Tag'

describe('Tag', () => {
  it('should render the label', () => {
    const { container } = renderWithProviders(<Tag label="Música" />)

    expect(screen.getByLabelText('Música')).toHaveTextContent('Música')
    expect(container.firstChild).toMatchSnapshot()
  })
})
