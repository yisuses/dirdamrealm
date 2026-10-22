import { screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { navigation } from '@blog/test/navigation'
import { renderWithProviders } from '@blog/test/render'

import { AdminShell } from './AdminShell'

vi.mock('@blog/app/admin/actions', () => ({ logout: vi.fn() }))

describe('AdminShell', () => {
  it('should show the user, the sections and the page, with the current section marked', () => {
    navigation.pathname = '/admin/categorias/nueva/'
    const { container } = renderWithProviders(
      <AdminShell userName="José Madrid" dataSource="db">
        <p>Contenido</p>
      </AdminShell>,
    )

    expect(screen.getByText('José Madrid')).toBeInTheDocument()
    expect(screen.getByText('Contenido')).toBeInTheDocument()
    const nav = screen.getByRole('navigation', { name: 'Secciones del panel' })
    expect(within(nav).getByRole('link', { name: 'Categorías' })).toHaveAttribute('aria-current', 'page')
    expect(within(nav).getByRole('link', { name: 'Inicio' })).not.toHaveAttribute('aria-current')
    expect(screen.getByRole('link', { name: 'Ver la web' })).toHaveAttribute('target', '_blank')
    expect(screen.getByRole('button', { name: 'Cerrar sesión' })).toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(container.firstChild).toMatchSnapshot()
  })

  it('should mark home only on the home page, with or without the trailing slash', () => {
    navigation.pathname = '/admin'
    renderWithProviders(
      <AdminShell userName="José" dataSource="db">
        {null}
      </AdminShell>,
    )

    expect(screen.getByRole('link', { name: 'Inicio' })).toHaveAttribute('aria-current', 'page')
  })

  it('should warn that edits are not live while the site still reads from Strapi', () => {
    renderWithProviders(
      <AdminShell userName="José" dataSource="strapi">
        {null}
      </AdminShell>,
    )

    expect(screen.getByRole('status')).toHaveTextContent('Modo de pruebas')
  })
})
