import { act, renderHook, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { renderWithProviders } from '@blog/test/render'

import { ColorModeProvider, useColorMode, useColorModeValue } from './color-mode'

function ColorModeProbe() {
  const { colorMode, toggleColorMode, setColorMode } = useColorMode()
  const label = useColorModeValue('light value', 'dark value')
  return (
    <div data-testid="probe">
      <span data-testid="mode">{colorMode}</span>
      <span>{label}</span>
      <button onClick={toggleColorMode}>toggle</button>
      <button onClick={() => setColorMode('dark')}>dark</button>
    </div>
  )
}

describe('color-mode', () => {
  it('should fall back to light when there is no theme provider', () => {
    const { result } = renderHook(() => ({ ...useColorMode(), value: useColorModeValue('light', 'dark') }))

    expect(result.current.colorMode).toBe('light')
    expect(result.current.value).toBe('light')
  })

  it('should default to the light theme and toggle between light and dark', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <ColorModeProvider>
        <ColorModeProbe />
      </ColorModeProvider>,
    )

    expect(screen.getByTestId('probe')).toMatchSnapshot()
    expect(screen.getByText('light value')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'toggle' }))
    expect(screen.getByTestId('mode')).toHaveTextContent('dark')
    expect(screen.getByText('dark value')).toBeInTheDocument()
    expect(document.documentElement).toHaveClass('dark')

    await user.click(screen.getByRole('button', { name: 'toggle' }))
    expect(screen.getByText('light value')).toBeInTheDocument()
  })

  it('should set the color mode directly', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <ColorModeProvider>
        <ColorModeProbe />
      </ColorModeProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'dark' }))

    expect(screen.getByText('dark value')).toBeInTheDocument()
  })

  it('should resolve the dark values when the theme is forced', () => {
    renderWithProviders(
      <ColorModeProvider forcedTheme="dark">
        <ColorModeProbe />
      </ColorModeProvider>,
    )

    expect(screen.getByText('dark value')).toBeInTheDocument()
    expect(screen.getByTestId('probe')).toMatchSnapshot()
  })

  it('should keep the provider defaults overridable', () => {
    const { result } = renderHook(() => useColorMode(), {
      wrapper: ({ children }) => <ColorModeProvider defaultTheme="dark">{children}</ColorModeProvider>,
    })

    expect(result.current.colorMode).toBe('dark')
    act(() => result.current.setColorMode('light'))
    expect(result.current.colorMode).toBe('light')
  })
})
