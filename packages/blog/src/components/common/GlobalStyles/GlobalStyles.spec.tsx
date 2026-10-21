import { describe, expect, it } from 'vitest'

import { renderWithProviders } from '@blog/test/render'

import { GlobalStyles } from './GlobalStyles'

describe('GlobalStyles', () => {
  it('should inject global styles without rendering markup', () => {
    const { container } = renderWithProviders(<GlobalStyles />)

    expect(container).toBeEmptyDOMElement()
    expect(container).toMatchSnapshot()
  })
})
