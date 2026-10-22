import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios from 'axios'
import { type Mocked, beforeEach, describe, expect, it, vi } from 'vitest'

import EditUserPage from '@blog/app/admin/(panel)/usuarios/[id]/page'
import NewUserPage from '@blog/app/admin/(panel)/usuarios/nuevo/page'
import UsersPage from '@blog/app/admin/(panel)/usuarios/page'
import { requireAdminSession } from '@blog/core/auth/session'
import { getUserForAdmin } from '@blog/db/queries/admin/users'
import { navigation } from '@blog/test/navigation'
import { renderWithProviders } from '@blog/test/render'

import { UserForm } from './UserForm'
import { UserList } from './UserList'

vi.mock('axios', async importOriginal => {
  const actual = await importOriginal<typeof import('axios')>()
  return { ...actual, default: { ...actual.default, post: vi.fn(), put: vi.fn() } }
})
vi.mock('@blog/db/queries/admin/users', () => ({
  listUsersForAdmin: vi.fn(async () => ['users']),
  getUserForAdmin: vi.fn(),
}))
vi.mock('@blog/core/auth/session', () => ({ requireAdminSession: vi.fn() }))
const mockedAxios = axios as Mocked<typeof axios>

const me = '11111111-1111-4111-8111-111111111111'
const ana = {
  id: '22222222-2222-4222-8222-222222222222',
  name: 'Ana',
  email: 'ana@example.com',
  active: true,
  writerName: null,
}
const jose = { id: me, name: 'José', email: 'jose@example.com', active: true, writerName: 'José Madrid' }
const notFound = expect.objectContaining({ digest: expect.stringContaining('NEXT_HTTP_ERROR_FALLBACK;404') })

describe('user pages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(requireAdminSession).mockResolvedValue({ user: { id: me }, expires: '' } as never)
  })

  it('should list users and pass the signed-in user to the forms', async () => {
    expect((await UsersPage()).props.users).toEqual(['users'])
    expect((await NewUserPage()).props.currentUserId).toBe(me)
    vi.mocked(getUserForAdmin).mockResolvedValueOnce(ana)
    expect((await EditUserPage({ params: Promise.resolve({ id: ana.id }) })).props).toMatchObject({
      user: ana,
      currentUserId: me,
    })
  })

  it('should fall back to no current user when the session has no id', async () => {
    vi.mocked(requireAdminSession).mockResolvedValue({ user: {}, expires: '' } as never)
    expect((await NewUserPage()).props.currentUserId).toBe('')
    vi.mocked(getUserForAdmin).mockResolvedValueOnce(ana)
    expect((await EditUserPage({ params: Promise.resolve({ id: ana.id }) })).props.currentUserId).toBe('')
  })

  it('should 404 for unknown or malformed ids', async () => {
    await expect(EditUserPage({ params: Promise.resolve({ id: ana.id }) })).rejects.toMatchObject(notFound)
    await expect(EditUserPage({ params: Promise.resolve({ id: 'nope' }) })).rejects.toMatchObject(notFound)
  })
})

describe('UserList', () => {
  it('should list users with their state and writer card', () => {
    const { container } = renderWithProviders(<UserList users={[ana, { ...jose, active: false }]} />)

    const [, first, second] = screen.getAllByRole('row')
    expect(within(first!).getByText('Activo')).toBeInTheDocument()
    expect(within(first!).getByText('—')).toBeInTheDocument()
    expect(within(second!).getByText('Desactivado')).toBeInTheDocument()
    expect(within(second!).getByText('José Madrid')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Editar a Ana' })).toHaveAttribute('href', `/admin/usuarios/${ana.id}/`)
    expect(container.firstChild).toMatchSnapshot()
  })
})

describe('UserForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create a user, requiring a confirmed password', async () => {
    const user = userEvent.setup()
    mockedAxios.post.mockResolvedValue({ data: { id: 'new' } })
    const { container } = renderWithProviders(<UserForm currentUserId={me} />)
    expect(container.firstChild).toMatchSnapshot()

    await user.type(screen.getByLabelText(/Nombre/), 'Ana')
    await user.type(screen.getByLabelText(/^Email/), 'ana@example.com')
    await user.type(screen.getByLabelText(/^Contraseña/), 'clave-larga-1')
    await user.type(screen.getByLabelText(/Repite/), 'clave-larga-1')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(mockedAxios.post).toHaveBeenCalledWith('/api/admin/users/', {
      name: 'Ana',
      email: 'ana@example.com',
      password: 'clave-larga-1',
      passwordConfirm: 'clave-larga-1',
    })
    expect(navigation.router.push).toHaveBeenCalledWith('/admin/usuarios/')
  })

  it('should not create a user without a password', async () => {
    const user = userEvent.setup()
    renderWithProviders(<UserForm currentUserId={me} />)

    await user.type(screen.getByLabelText(/Nombre/), 'Ana')
    await user.type(screen.getByLabelText(/^Email/), 'ana@example.com')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(
      await screen.findByText('Al menos 10 caracteres', { selector: '.chakra-field__errorText' }),
    ).toBeInTheDocument()
    expect(mockedAxios.post).not.toHaveBeenCalled()
  })

  it('should edit another user, deactivating them and keeping the password when left empty', async () => {
    const user = userEvent.setup()
    mockedAxios.put.mockResolvedValue({ data: { id: ana.id } })
    renderWithProviders(<UserForm user={ana} currentUserId={me} />)

    await user.click(screen.getByRole('checkbox', { name: 'Puede entrar en el panel (activo)' }))
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(mockedAxios.put).toHaveBeenCalledWith(`/api/admin/users/${ana.id}/`, {
      name: 'Ana',
      email: 'ana@example.com',
      active: false,
      password: '',
      passwordConfirm: '',
    })
  })

  it('should not let you deactivate yourself, and show API errors', async () => {
    const user = userEvent.setup()
    mockedAxios.put.mockRejectedValue(new Error('network'))
    renderWithProviders(<UserForm user={jose} currentUserId={me} />)

    expect(screen.getByRole('checkbox', { name: 'Puede entrar en el panel (activo)' })).toBeDisabled()
    expect(screen.getByText('No puedes desactivar tu propio usuario.')).toBeInTheDocument()
    await user.type(screen.getByLabelText(/Contraseña nueva/), 'clave-larga-1')
    await user.type(screen.getByLabelText(/Repite/), 'otra-clave-1')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))
    expect(await screen.findByText('Las dos contraseñas no coinciden')).toBeInTheDocument()

    await user.clear(screen.getByLabelText(/Repite/))
    await user.type(screen.getByLabelText(/Repite/), 'clave-larga-1')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('No se ha podido guardar.')
  })

  it('should show invalid names and emails', async () => {
    const user = userEvent.setup()
    renderWithProviders(<UserForm user={ana} currentUserId={me} />)

    await user.clear(screen.getByLabelText(/Nombre/))
    await user.clear(screen.getByLabelText(/^Email/))
    await user.type(screen.getByLabelText(/^Email/), 'ana')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(await screen.findByText('Escribe el nombre')).toBeInTheDocument()
    expect(screen.getByText('Escribe un email válido')).toBeInTheDocument()
  })
})
