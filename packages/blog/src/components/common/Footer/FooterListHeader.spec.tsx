import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderWithProviders } from '@blog/test/render'

import { FooterListHeader } from './FooterListHeader'

describe('FooterListHeader', () => {
  it('should render its children', () => {
    const { container } = renderWithProviders(<FooterListHeader>Categorías</FooterListHeader>)

    expect(screen.getByText('Categorías')).toBeInTheDocument()
    expect(container.firstChild).toMatchSnapshot()
  })
})
