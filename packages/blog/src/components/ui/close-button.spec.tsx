import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { renderWithProviders } from '@blog/test/render'

import { CloseButton } from './close-button'

describe('CloseButton', () => {
  it('should render an accessible ghost button with the X icon by default', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    const { container } = renderWithProviders(<CloseButton onClick={onClick} />)

    const button = screen.getByRole('button', { name: 'Close' })
    expect(button.querySelector('svg')).toBeInTheDocument()
    await user.click(button)
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(container.firstChild).toMatchSnapshot()
  })

  it('should render the given children instead of the icon', () => {
    renderWithProviders(<CloseButton aria-label="Cerrar">x</CloseButton>)

    const button = screen.getByRole('button', { name: 'Cerrar' })
    expect(button).toHaveTextContent('x')
    expect(button.querySelector('svg')).not.toBeInTheDocument()
  })
})
