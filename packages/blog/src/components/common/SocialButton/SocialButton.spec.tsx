import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { renderWithProviders } from '@blog/test/render'

import { SocialButton } from './SocialButton'

describe('SocialButton', () => {
  it('should render an external link with a hidden label', () => {
    const { container } = renderWithProviders(
      <SocialButton label="Twitter" href="https://twitter.com/whemotion">
        <svg data-testid="icon" />
      </SocialButton>,
    )

    const link = screen.getByRole('link', { name: 'Twitter' })
    expect(link).toHaveAttribute('href', 'https://twitter.com/whemotion')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noreferrer')
    expect(screen.getByTestId('icon')).toBeInTheDocument()
    expect(container.firstChild).toMatchSnapshot()
  })

  it('should call onClick when clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    renderWithProviders(
      <SocialButton label="Share" onClick={onClick}>
        <span>icon</span>
      </SocialButton>,
    )

    await user.click(screen.getByText('Share'))

    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
