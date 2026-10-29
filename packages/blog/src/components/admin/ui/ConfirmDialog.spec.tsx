import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { renderWithProviders } from '@blog/test/render'

import { ConfirmDialog } from './ConfirmDialog'

const renderDialog = () => {
  const onConfirm = vi.fn()
  const onCancel = vi.fn()
  renderWithProviders(
    <ConfirmDialog open title="¿Borrar?" confirmLabel="Sí, borrar" onConfirm={onConfirm} onCancel={onCancel}>
      No se puede deshacer.
    </ConfirmDialog>,
  )
  return { onConfirm, onCancel }
}

describe('ConfirmDialog', () => {
  it('should ask with a title, an explanation and both choices', async () => {
    const user = userEvent.setup()
    const { onConfirm, onCancel } = renderDialog()

    const dialog = await screen.findByRole('alertdialog', { name: '¿Borrar?' })
    expect(dialog).toHaveTextContent('No se puede deshacer.')
    await user.click(screen.getByRole('button', { name: 'Sí, borrar' }))
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('should treat closing it with Escape as cancelling', async () => {
    const user = userEvent.setup()
    const { onConfirm, onCancel } = renderDialog()

    await screen.findByRole('alertdialog')
    await user.keyboard('{Escape}')

    await vi.waitFor(() => expect(onCancel).toHaveBeenCalled())
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('should color the confirmation red by default and gold when asked', async () => {
    const { rerender } = renderWithProviders(
      <ConfirmDialog open title="¿Publicar?" confirmLabel="Sí" onConfirm={vi.fn()} onCancel={vi.fn()}>
        Se verá en la web.
      </ConfirmDialog>,
    )
    const red = (await screen.findByRole('button', { name: 'Sí' })).className

    rerender(
      <ConfirmDialog
        open
        title="¿Publicar?"
        confirmLabel="Sí"
        confirmPalette="gold"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      >
        Se verá en la web.
      </ConfirmDialog>,
    )
    expect(screen.getByRole('button', { name: 'Sí' }).className).not.toBe(red)
  })
})
