import { describe, expect, it } from 'vitest'

import { renderWithProviders } from '@blog/test/render'

import { LogoContainer } from './Header.styles'

describe('LogoContainer', () => {
  it('should show the mobile logo and hide the desktop one below the lg breakpoint', () => {
    const { container } = renderWithProviders(
      <LogoContainer>
        <span className="desktop">desktop</span>
        <span className="mobile">mobile</span>
      </LogoContainer>,
    )

    expect(container.querySelector('.desktop')).toHaveStyle({ display: 'none' })
    expect(container.querySelector('.mobile')).toHaveStyle({ display: 'inline-block' })
    expect(container.firstChild).toMatchSnapshot()
  })
})
