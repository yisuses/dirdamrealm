import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderWithProviders } from '@blog/test/render'

import { Ribbon } from './Ribbon'

describe('Ribbon', () => {
  it('should render its children', () => {
    const { container } = renderWithProviders(<Ribbon>New</Ribbon>)

    expect(screen.getByText('New').tagName).toBe('SPAN')
    expect(container.firstChild).toMatchSnapshot()
  })
})
