import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { waitForOverlay } from '@blog/test/overlay'
import { renderWithProviders } from '@blog/test/render'

import {
  DrawerActionTrigger,
  DrawerBody,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerRoot,
  DrawerTitle,
  DrawerTrigger,
} from './drawer'

describe('Drawer', () => {
  it('should open from the trigger in a portal with a backdrop and close from the close trigger', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    renderWithProviders(
      <DrawerRoot onOpenChange={onOpenChange}>
        <DrawerTrigger>Menú</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Categorías</DrawerTitle>
          </DrawerHeader>
          <DrawerBody>
            <DrawerDescription>Elige una</DrawerDescription>
          </DrawerBody>
          <DrawerFooter>
            <DrawerActionTrigger>Cancelar</DrawerActionTrigger>
          </DrawerFooter>
          <DrawerCloseTrigger />
        </DrawerContent>
      </DrawerRoot>,
    )

    await user.click(screen.getByRole('button', { name: 'Menú' }))

    const drawer = await screen.findByRole('dialog', { name: 'Categorías' })
    expect(drawer).toHaveAccessibleDescription('Elige una')
    expect(document.querySelector('[data-part="backdrop"]')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(onOpenChange).toHaveBeenLastCalledWith(expect.objectContaining({ open: false }))
  })

  it('should render inline without a backdrop', async () => {
    const { container } = renderWithProviders(
      <DrawerRoot open>
        <DrawerContent portalled={false} backdrop={false} offset="4">
          <DrawerTitle>Inline</DrawerTitle>
        </DrawerContent>
      </DrawerRoot>,
    )

    expect(container.querySelector('[data-part="backdrop"]')).not.toBeInTheDocument()
    expect(screen.getByRole('dialog', { name: 'Inline' })).toBeInTheDocument()
    await waitForOverlay(screen.getByRole('dialog', { name: 'Inline' }))
    expect(container.firstChild).toMatchSnapshot()
  })
})
