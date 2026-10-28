import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios from 'axios'
import { type Mocked, beforeEach, describe, expect, it, vi } from 'vitest'

import EditWriterPage from '@blog/app/admin/(panel)/autores/[id]/page'
import NewWriterPage from '@blog/app/admin/(panel)/autores/nuevo/page'
import WritersPage from '@blog/app/admin/(panel)/autores/page'
import { getWriterForAdmin } from '@blog/db/queries/admin/writers'
import { navigation } from '@blog/test/navigation'
import { renderWithProviders } from '@blog/test/render'

import { WriterForm } from './WriterForm'
import { WriterList } from './WriterList'

vi.mock('axios', async importOriginal => {
  const actual = await importOriginal<typeof import('axios')>()
  return { ...actual, default: { ...actual.default, post: vi.fn(), put: vi.fn(), delete: vi.fn() } }
})
vi.mock('@blog/db/queries/admin/writers', () => ({
  listWritersForAdmin: vi.fn(async () => ['writers']),
  listUserOptions: vi.fn(async () => ['users']),
  getWriterForAdmin: vi.fn(),
}))
const mockedAxios = axios as Mocked<typeof axios>

const jose = {
  id: 'w1',
  name: 'José Madrid',
  twitter: '@jose',
  personalUrl: '',
  userId: '11111111-1111-4111-8111-111111111111',
  userName: 'José',
  posts: 117,
}
const joseUser = '11111111-1111-4111-8111-111111111111'
const saulUser = '22222222-2222-4222-8222-222222222222'
const users = [
  { id: joseUser, name: 'José' },
  { id: saulUser, name: 'Saúl' },
]
const uuid = '5efd132e-40a2-4f98-bc16-cc1fa8aa118e'
const notFound = expect.objectContaining({ digest: expect.stringContaining('NEXT_HTTP_ERROR_FALLBACK;404') })

describe('writer pages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should load the list, the user options and the writer being edited', async () => {
    expect((await WritersPage()).props.writers).toEqual(['writers'])
    expect((await NewWriterPage()).props.users).toEqual(['users'])
    vi.mocked(getWriterForAdmin).mockResolvedValueOnce(jose)
    expect((await EditWriterPage({ params: Promise.resolve({ id: uuid }) })).props.writer).toBe(jose)
  })

  it('should 404 for unknown or malformed ids', async () => {
    await expect(EditWriterPage({ params: Promise.resolve({ id: uuid }) })).rejects.toMatchObject(notFound)
    await expect(EditWriterPage({ params: Promise.resolve({ id: 'nope' }) })).rejects.toMatchObject(notFound)
  })
})

describe('WriterList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should list writers with their panel user and posts', () => {
    const { container } = renderWithProviders(
      <WriterList writers={[jose, { ...jose, id: 'w2', name: 'Saúl', userName: null, posts: 0 }]} />,
    )

    const [, first, second] = screen.getAllByRole('row')
    expect(within(first!).getByText('José')).toBeInTheDocument()
    expect(within(first!).getByText('117')).toBeInTheDocument()
    expect(within(second!).getByText('—')).toBeInTheDocument()
    expect(container.firstChild).toMatchSnapshot()
  })

  it('should say when there are no writers', () => {
    renderWithProviders(<WriterList writers={[]} />)

    expect(screen.getByText('Todavía no hay autores.')).toBeInTheDocument()
  })

  it('should warn that posts lose their writer, then delete and refresh', async () => {
    const user = userEvent.setup()
    mockedAxios.delete.mockResolvedValue({ status: 204 })
    renderWithProviders(<WriterList writers={[jose]} />)

    await user.click(screen.getByRole('button', { name: 'Borrar José Madrid' }))
    const dialog = await screen.findByRole('alertdialog')
    expect(dialog).toHaveTextContent('Firma 117 entradas: quedarán sin autor')
    await user.click(within(dialog).getByRole('button', { name: 'Sí, borrar' }))

    expect(mockedAxios.delete).toHaveBeenCalledWith('/api/admin/writers/w1/', { params: { confirm: true } })
    expect(await screen.findByRole('status')).toHaveTextContent('Se ha borrado la ficha de José Madrid.')
    expect(navigation.router.refresh).toHaveBeenCalled()
  })

  it('should word the warning for one or no posts and report failures', async () => {
    const user = userEvent.setup()
    mockedAxios.delete.mockRejectedValue(new Error('network'))
    renderWithProviders(
      <WriterList
        writers={[
          { ...jose, posts: 1 },
          { ...jose, id: 'w2', name: 'Ana', posts: 0 },
        ]}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Borrar José Madrid' }))
    expect(await screen.findByRole('alertdialog')).toHaveTextContent('Firma 1 entrada:')
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    await user.click(screen.getByRole('button', { name: 'Borrar Ana' }))
    expect(await screen.findByRole('alertdialog')).toHaveTextContent('No firma ninguna entrada.')
    await user.click(screen.getByRole('button', { name: 'Sí, borrar' }))

    expect(await screen.findByRole('status')).toHaveTextContent('No se ha podido borrar.')
  })
})

describe('WriterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create a writer linked to a user', async () => {
    const user = userEvent.setup()
    mockedAxios.post.mockResolvedValue({ data: { id: 'new' } })
    const { container } = renderWithProviders(<WriterForm users={users} />)
    expect(container.firstChild).toMatchSnapshot()

    await user.type(screen.getByLabelText(/Nombre/), 'Saúl de León')
    await user.type(screen.getByLabelText(/Web personal/), 'https://sawl.dev')
    await user.selectOptions(screen.getByLabelText(/Usuario del panel/), saulUser)
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(mockedAxios.post).toHaveBeenCalledWith('/api/admin/writers/', {
      name: 'Saúl de León',
      twitter: '',
      personalUrl: 'https://sawl.dev',
      userId: saulUser,
    })
    expect(navigation.router.push).toHaveBeenCalledWith('/admin/autores/')
  })

  it('should edit a writer and show API errors', async () => {
    const user = userEvent.setup()
    mockedAxios.put.mockRejectedValue(new Error('network'))
    renderWithProviders(<WriterForm writer={jose} users={users} />)

    expect(screen.getByRole('heading', { name: 'Editar a José Madrid' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(mockedAxios.put).toHaveBeenCalledWith('/api/admin/writers/w1/', {
      name: 'José Madrid',
      twitter: '@jose',
      personalUrl: '',
      userId: joseUser,
    })
    expect(await screen.findByRole('alert')).toHaveTextContent('No se ha podido guardar.')
  })

  it('should show validation errors without sending', async () => {
    const user = userEvent.setup()
    renderWithProviders(<WriterForm users={users} />)

    await user.type(screen.getByLabelText(/Usuario de Twitter/), 'x'.repeat(61))
    await user.type(screen.getByLabelText(/Web personal/), 'sawl.dev')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(await screen.findByText('Escribe el nombre')).toBeInTheDocument()
    expect(screen.getByText('Máximo 60 caracteres')).toBeInTheDocument()
    expect(screen.getByText(/Escribe la dirección completa/)).toBeInTheDocument()
    expect(mockedAxios.post).not.toHaveBeenCalled()
  })
})
