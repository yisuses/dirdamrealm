import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios, { AxiosError, type AxiosResponse } from 'axios'
import { type Mocked, beforeEach, describe, expect, it, vi } from 'vitest'

import { navigation } from '@blog/test/navigation'
import { renderWithProviders } from '@blog/test/render'

import { CategoryForm } from './CategoryForm'

vi.mock('axios', async importOriginal => {
  const actual = await importOriginal<typeof import('axios')>()
  return { ...actual, default: { ...actual.default, post: vi.fn(), put: vi.fn() } }
})
const mockedAxios = axios as Mocked<typeof axios>

const existing = {
  id: 'c1',
  code: 'TRA',
  main: true,
  posts: 2,
  es: { name: 'Viajes', description: 'Por el mundo' },
  en: { name: 'Travel', description: '' },
}

const conflict = (message: string) =>
  new AxiosError('conflict', '409', undefined, undefined, {
    status: 409,
    data: { error: message },
  } as AxiosResponse)

async function fillNew() {
  const user = userEvent.setup()
  await user.type(screen.getByLabelText(/Código/), 'cine')
  const [esName, enName] = screen.getAllByLabelText(/Nombre/)
  await user.type(esName!, 'Cine')
  await user.type(enName!, 'Cinema')
  return user
}

describe('CategoryForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create a category, uppercasing the code, and go back to the list', async () => {
    mockedAxios.post.mockResolvedValue({ data: { id: 'new' } })
    const { container } = renderWithProviders(<CategoryForm />)
    expect(screen.getByRole('heading', { name: 'Nueva categoría' })).toBeInTheDocument()
    expect(container.firstChild).toMatchSnapshot()

    const user = await fillNew()
    await user.click(screen.getByRole('checkbox', { name: 'Aparece en el menú principal de la web' }))
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(mockedAxios.post).toHaveBeenCalledWith('/api/admin/categories/', {
      code: 'CINE',
      main: true,
      es: { name: 'Cine', description: '' },
      en: { name: 'Cinema', description: '' },
    })
    expect(navigation.router.push).toHaveBeenCalledWith('/admin/categorias/')
    expect(navigation.router.refresh).toHaveBeenCalled()
  })

  it('should edit an existing category', async () => {
    const user = userEvent.setup()
    mockedAxios.put.mockResolvedValue({ data: { id: 'c1' } })
    renderWithProviders(<CategoryForm category={existing} />)

    expect(screen.getByRole('heading', { name: 'Editar «Viajes»' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(mockedAxios.put).toHaveBeenCalledWith('/api/admin/categories/c1/', {
      code: 'TRA',
      main: true,
      es: existing.es,
      en: existing.en,
    })
  })

  it('should show validation errors next to each field without sending', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CategoryForm />)

    await user.type(screen.getByLabelText(/Código/), 'mal código')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(await screen.findByText(/Solo letras mayúsculas/)).toBeInTheDocument()
    expect(screen.getAllByText('Escribe el nombre')).toHaveLength(2)
    expect(mockedAxios.post).not.toHaveBeenCalled()
  })

  it('should put a taken code error on the code field', async () => {
    mockedAxios.post.mockRejectedValue(conflict('Ya hay una categoría con ese código'))
    renderWithProviders(<CategoryForm />)

    const user = await fillNew()
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(await screen.findByText('Ya hay una categoría con ese código')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('should show other failures as a general error', async () => {
    mockedAxios.post.mockRejectedValue(new Error('network'))
    renderWithProviders(<CategoryForm />)

    const user = await fillNew()
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('No se ha podido guardar. Inténtalo de nuevo.')
  })
})
