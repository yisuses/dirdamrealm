import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { requireAdminSession } from '@blog/core/auth/session'
import { renderWithProviders } from '@blog/test/render'

import PanelLayout from './layout'
import AdminHomePage from './page'

vi.mock('@blog/core/auth/session', () => ({ requireAdminSession: vi.fn() }))
vi.mock('@blog/data', () => ({ dataSource: () => 'strapi' }))
vi.mock('@blog/app/admin/actions', () => ({ logout: vi.fn() }))

describe('admin panel', () => {
  it('should wrap every page in the shell with the signed-in user and the data source', async () => {
    vi.mocked(requireAdminSession).mockResolvedValue({ user: { name: 'José' }, expires: '' } as never)

    renderWithProviders(await PanelLayout({ children: <p>Página</p> }))

    expect(screen.getByText('José')).toBeInTheDocument()
    expect(screen.getByText('Página')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Modo de pruebas')
  })

  it('should show no name when the session carries none', async () => {
    vi.mocked(requireAdminSession).mockResolvedValue({ user: {}, expires: '' } as never)

    renderWithProviders(await PanelLayout({ children: null }))

    expect(screen.getByRole('button', { name: 'Cerrar sesión' })).toBeInTheDocument()
  })

  it('should offer every section except home on the home page', () => {
    const { container } = renderWithProviders(<AdminHomePage />)

    expect(screen.getByRole('heading', { name: 'Inicio' })).toBeInTheDocument()
    expect(screen.getAllByRole('link').map(link => link.textContent)).toEqual([
      'Entradas',
      'Imágenes',
      'Categorías',
      'Contacto y redes',
      'Autores',
      'Usuarios',
    ])
    expect(container.firstChild).toMatchSnapshot()
  })
})
