import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentProps } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { navigation } from '@blog/test/navigation'
import { waitForOverlay } from '@blog/test/overlay'
import { renderWithProviders } from '@blog/test/render'

import { Modal } from './Modal'

// The real dialog, with its props kept so a test can raise an "opened" change, which nothing
// inside the modal can trigger.
const dialogRoot = vi.hoisted(() => ({
  props: undefined as undefined | { onOpenChange?: (d: { open: boolean }) => void },
}))
vi.mock('@blog/components/ui/dialog', async importOriginal => {
  const actual = await importOriginal<typeof import('@blog/components/ui/dialog')>()
  return {
    ...actual,
    DialogRoot: (props: ComponentProps<typeof actual.DialogRoot>) => {
      dialogRoot.props = props
      return <actual.DialogRoot {...props} />
    },
  }
})

describe('Modal', () => {
  it('should render the title and content when open', async () => {
    renderWithProviders(
      <Modal isOpen onClose={vi.fn()} title="Buscar">
        <p>Contenido</p>
      </Modal>,
    )

    const dialog = await screen.findByRole('dialog')
    expect(screen.getByText('Buscar')).toBeInTheDocument()
    expect(screen.getByText('Contenido')).toBeInTheDocument()
    await waitForOverlay(dialog)
    expect(dialog).toMatchSnapshot()
  })

  it('should render nothing when closed', () => {
    renderWithProviders(<Modal isOpen={false} onClose={vi.fn()} title="Buscar" />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('should only call onClose for changes that close the dialog', () => {
    const onClose = vi.fn()
    renderWithProviders(<Modal isOpen={false} onClose={onClose} title="Buscar" />)

    act(() => dialogRoot.props?.onOpenChange?.({ open: true }))
    expect(onClose).not.toHaveBeenCalled()

    act(() => dialogRoot.props?.onOpenChange?.({ open: false }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should render without a header when there is no title', async () => {
    renderWithProviders(
      <Modal isOpen onClose={vi.fn()}>
        <p>Contenido</p>
      </Modal>,
    )

    expect(await screen.findByRole('dialog')).toHaveTextContent('Contenido')
    expect(screen.queryByText('Buscar')).not.toBeInTheDocument()
  })

  it('should call onClose from the close trigger', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderWithProviders(<Modal isOpen onClose={onClose} title="Buscar" />)

    await user.click(await screen.findByRole('button', { name: /close/i }))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should close on navigation but not on the first render', async () => {
    const onClose = vi.fn()
    const { rerender } = renderWithProviders(<Modal isOpen onClose={onClose} title="Buscar" />)
    await screen.findByRole('dialog')
    expect(onClose).not.toHaveBeenCalled()

    navigation.pathname = '/es/archive/'
    rerender(<Modal isOpen onClose={onClose} title="Buscar" />)

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1))
  })
})
