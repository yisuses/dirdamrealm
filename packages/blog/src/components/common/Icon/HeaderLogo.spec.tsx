import { describe, expect, it } from 'vitest'

import { renderWithProviders } from '@blog/test/render'

import { HeaderLogo } from './HeaderLogo'

describe('HeaderLogo', () => {
  it('should render the svg logo forwarding its props', () => {
    const { container } = renderWithProviders(<HeaderLogo color="#fafafa" aria-label="logo" />)

    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('color', '#fafafa')
    expect(svg).toHaveAttribute('aria-label', 'logo')
    expect(svg).toHaveAttribute('fill', 'currentColor')
    expect(container.firstChild).toMatchSnapshot()
  })
})
