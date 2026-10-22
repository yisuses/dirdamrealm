import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios from 'axios'
import { type Mocked, beforeEach, describe, expect, it, vi } from 'vitest'

import { navigation } from '@blog/test/navigation'
import { renderWithProviders } from '@blog/test/render'

import { CategoryList } from './CategoryList'

vi.mock('axios', async importOriginal => {
  const actual = await importOriginal<typeof import('axios')>()
  return { ...actual, default: { ...actual.default, delete: vi.fn() } }
})
const mockedAxios = axios as Mocked<typeof axios>

const category = (id: string, name: string, posts: number, main = false) => ({
  id,
  code: name.toUpperCase().slice(0, 3),
  main,
  posts,
  es: { name, description: '' },
  en: { name: `${name} EN`, description: '' },
})
const categories = [category('c1', 'Viajes', 3, true), category('c2', 'Cine', 0)]

describe('CategoryList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should list the categories with their translation, code, usage and actions', () => {
    const { container } = renderWithProviders(<CategoryList categories={categories} />)

    const [, first] = screen.getAllByRole('row')
    expect(within(first!).getByText('Viajes')).toBeInTheDocument()
    expect(within(first!).getByText('Menú principal')).toBeInTheDocument()
    expect(within(first!).getByText('Viajes EN')).toBeInTheDocument()
    expect(within(first!).getByText('VIA')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Editar Viajes' })).toHaveAttribute('href', '/admin/categorias/c1/')
    expect(screen.getByRole('link', { name: 'Nueva categoría' })).toHaveAttribute('href', '/admin/categorias/nueva/')
    expect(container.firstChild).toMatchSnapshot()
  })

  it('should say when there are no categories', () => {
    renderWithProviders(<CategoryList categories={[]} />)

    expect(screen.getByText('Todavía no hay categorías.')).toBeInTheDocument()
  })

  it('should warn how many posts a category is on before deleting it, then refresh', async () => {
    const user = userEvent.setup()
    mockedAxios.delete.mockResolvedValue({ status: 204 })
    renderWithProviders(<CategoryList categories={categories} />)

    await user.click(screen.getByRole('button', { name: 'Borrar Viajes' }))
    const dialog = await screen.findByRole('alertdialog')
    expect(dialog).toHaveTextContent('¿Borrar «Viajes»?')
    expect(dialog).toHaveTextContent('Está en 3 entradas: se quitará de ellas, pero las entradas no se borran.')
    await user.click(within(dialog).getByRole('button', { name: 'Sí, borrar' }))

    expect(mockedAxios.delete).toHaveBeenCalledWith('/api/admin/categories/c1/', { params: { confirm: true } })
    expect(await screen.findByRole('status')).toHaveTextContent('Se ha borrado la categoría «Viajes».')
    expect(navigation.router.refresh).toHaveBeenCalled()
  })

  it('should use the singular for one post and say when a category is unused', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CategoryList categories={[category('c3', 'Uno', 1), category('c2', 'Cine', 0)]} />)

    await user.click(screen.getByRole('button', { name: 'Borrar Uno' }))
    expect(await screen.findByRole('alertdialog')).toHaveTextContent('Está en 1 entrada:')
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))

    await user.click(screen.getByRole('button', { name: 'Borrar Cine' }))
    expect(await screen.findByRole('alertdialog')).toHaveTextContent('No está en ninguna entrada.')
  })

  it('should cancel without deleting, also with Escape', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CategoryList categories={categories} />)

    await user.click(screen.getByRole('button', { name: 'Borrar Cine' }))
    await user.click(await screen.findByRole('button', { name: 'Cancelar' }))
    await user.click(screen.getByRole('button', { name: 'Borrar Cine' }))
    await screen.findByRole('alertdialog')
    await user.keyboard('{Escape}')

    expect(mockedAxios.delete).not.toHaveBeenCalled()
  })

  it('should explain when the deletion fails', async () => {
    const user = userEvent.setup()
    mockedAxios.delete.mockRejectedValue(new Error('network'))
    renderWithProviders(<CategoryList categories={categories} />)

    await user.click(screen.getByRole('button', { name: 'Borrar Cine' }))
    await user.click(await screen.findByRole('button', { name: 'Sí, borrar' }))

    expect(await screen.findByRole('status')).toHaveTextContent('No se ha podido borrar. Inténtalo de nuevo.')
  })
})
