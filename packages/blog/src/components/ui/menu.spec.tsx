import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { renderWithProviders } from '@blog/test/render'

import {
  MenuArrow,
  MenuCheckboxItem,
  MenuContent,
  MenuItem,
  MenuItemGroup,
  MenuRadioItem,
  MenuRadioItemGroup,
  MenuRoot,
  MenuSeparator,
  MenuTrigger,
  MenuTriggerItem,
} from './menu'

describe('Menu', () => {
  it('should open from the trigger in a portal and select an item', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    renderWithProviders(
      <MenuRoot onSelect={onSelect}>
        <MenuTrigger>Opciones</MenuTrigger>
        <MenuContent>
          <MenuItem value="edit">Editar</MenuItem>
        </MenuContent>
      </MenuRoot>,
    )

    await user.click(screen.getByRole('button', { name: 'Opciones' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Editar' }))

    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ value: 'edit' }))
  })

  it('should render every item flavour inline', async () => {
    const user = userEvent.setup()
    const onCheckedChange = vi.fn()
    const { container } = renderWithProviders(
      <MenuRoot open>
        <MenuTrigger>Opciones</MenuTrigger>
        <MenuContent portalled={false}>
          <MenuArrow />
          <MenuItemGroup title="Vista">
            <MenuCheckboxItem value="grid" checked onCheckedChange={onCheckedChange}>
              Cuadrícula
            </MenuCheckboxItem>
          </MenuItemGroup>
          <MenuSeparator />
          <MenuItemGroup>
            <MenuRadioItemGroup value="es">
              <MenuRadioItem value="es">Español</MenuRadioItem>
              <MenuRadioItem value="en">Inglés</MenuRadioItem>
            </MenuRadioItemGroup>
          </MenuItemGroup>
          <MenuRoot>
            <MenuTriggerItem value="more" startIcon={<span>*</span>}>
              Más
            </MenuTriggerItem>
            <MenuContent portalled={false}>
              <MenuItem value="sub">Submenú</MenuItem>
            </MenuContent>
          </MenuRoot>
        </MenuContent>
      </MenuRoot>,
    )

    expect(screen.getByText('Vista')).toBeInTheDocument()
    expect(screen.getByRole('menuitemcheckbox', { name: 'Cuadrícula' })).toBeChecked()
    expect(screen.getByRole('menuitemradio', { name: 'Español' })).toBeChecked()
    expect(screen.getByRole('menuitemradio', { name: 'Inglés' })).not.toBeChecked()
    expect(screen.getByRole('menuitem', { name: '*Más' })).toHaveAttribute('aria-haspopup', 'menu')
    expect(container.firstChild?.nextSibling).toMatchSnapshot()

    await user.click(screen.getByRole('menuitemcheckbox', { name: 'Cuadrícula' }))
    expect(onCheckedChange).toHaveBeenCalledWith(false)
  })
})
