import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { waitForOverlay } from '@blog/test/overlay'
import { renderWithProviders } from '@blog/test/render'

import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from './dialog'

describe('Dialog', () => {
  it('should open from the trigger in a portal with a backdrop and close from the close trigger', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    renderWithProviders(
      <DialogRoot onOpenChange={onOpenChange}>
        <DialogTrigger>Abrir</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Título</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <DialogDescription>Descripción</DialogDescription>
          </DialogBody>
          <DialogFooter>
            <DialogActionTrigger>Cancelar</DialogActionTrigger>
          </DialogFooter>
          <DialogCloseTrigger />
        </DialogContent>
      </DialogRoot>,
    )

    await user.click(screen.getByRole('button', { name: 'Abrir' }))

    const dialog = await screen.findByRole('dialog', { name: 'Título' })
    expect(dialog).toHaveAccessibleDescription('Descripción')
    expect(document.querySelector('[data-part="backdrop"]')).toBeInTheDocument()
    expect(onOpenChange).toHaveBeenLastCalledWith(expect.objectContaining({ open: true }))

    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(onOpenChange).toHaveBeenLastCalledWith(expect.objectContaining({ open: false }))
  })

  it('should render inline without a backdrop and with custom close content', async () => {
    const { container } = renderWithProviders(
      <DialogRoot open>
        <DialogContent portalled={false} backdrop={false}>
          <DialogTitle>Inline</DialogTitle>
          <DialogCloseTrigger aria-label="Cerrar">x</DialogCloseTrigger>
        </DialogContent>
      </DialogRoot>,
    )

    expect(container.querySelector('[data-part="backdrop"]')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cerrar' })).toHaveTextContent('x')
    await waitForOverlay(screen.getByRole('dialog'))
    expect(container.firstChild).toMatchSnapshot()
  })
})
