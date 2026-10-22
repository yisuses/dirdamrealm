import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { signIn } from 'next-auth/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { renderWithProviders } from '@blog/test/render'

import { LoginForm } from './LoginForm'

vi.mock('next-auth/react', () => ({ signIn: vi.fn() }))

const assign = vi.fn()

async function submit(email = 'jose@example.com', password = 'secreta') {
  const user = userEvent.setup()
  await user.type(screen.getByLabelText(/Email/), email)
  await user.type(screen.getByLabelText(/Contraseña/), password)
  await user.click(screen.getByRole('button', { name: 'Entrar' }))
}

describe('LoginForm', () => {
  beforeEach(() => {
    vi.spyOn(window, 'location', 'get').mockReturnValue({ ...window.location, assign } as Location)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.mocked(signIn).mockReset()
    assign.mockReset()
  })

  it('should render the form with the site logo', () => {
    const { container } = renderWithProviders(<LoginForm />)

    expect(screen.getByRole('heading', { name: 'Panel de Emoción Blanca' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '¿Has olvidado la contraseña?' })).toHaveAttribute(
      'href',
      '/admin/recuperar-contrasena/',
    )
    expect(container.firstChild).toMatchSnapshot()
  })

  it('should sign in and load the panel', async () => {
    vi.mocked(signIn).mockResolvedValue({ ok: true, error: undefined, status: 200, url: '', code: undefined })
    renderWithProviders(<LoginForm />)

    await submit()

    expect(signIn).toHaveBeenCalledWith('credentials', {
      email: 'jose@example.com',
      password: 'secreta',
      redirect: false,
    })
    expect(assign).toHaveBeenCalledWith('/admin/')
  })

  it('should say the credentials are wrong without telling which one', async () => {
    vi.mocked(signIn).mockResolvedValue({
      ok: false,
      error: 'CredentialsSignin',
      status: 401,
      url: '',
      code: 'credentials',
    })
    renderWithProviders(<LoginForm />)

    await submit()

    expect(await screen.findByRole('alert')).toHaveTextContent('El email o la contraseña no son correctos.')
    expect(assign).not.toHaveBeenCalled()
  })

  it('should ask to wait after too many attempts', async () => {
    vi.mocked(signIn).mockResolvedValue({ ok: false, error: 'TooMany', status: 429, url: '', code: undefined })
    renderWithProviders(<LoginForm />)

    await submit()

    expect(await screen.findByRole('alert')).toHaveTextContent('Demasiados intentos')
  })
})
