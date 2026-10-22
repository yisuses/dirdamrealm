import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios from 'axios'
import { type Mocked, beforeEach, describe, expect, it, vi } from 'vitest'

import ResetPasswordPage from '@blog/app/admin/nueva-contrasena/page'
import RequestResetPage from '@blog/app/admin/recuperar-contrasena/page'
import { renderWithProviders } from '@blog/test/render'

import { PasswordInput } from '../ui/PasswordInput'
import { RequestResetForm } from './RequestResetForm'
import { ResetPasswordForm } from './ResetPasswordForm'

vi.mock('axios', async importOriginal => {
  const actual = await importOriginal<typeof import('axios')>()
  return { ...actual, default: { ...actual.default, post: vi.fn() } }
})
const mockedAxios = axios as Mocked<typeof axios>

describe('password recovery pages', () => {
  it('should render the request form and pass the token from the link', async () => {
    expect(RequestResetPage().type).toBe(RequestResetForm)
    expect((await ResetPasswordPage({ searchParams: Promise.resolve({ token: 'abc' }) })).props.token).toBe('abc')
    expect(
      (await ResetPasswordPage({ searchParams: Promise.resolve({ token: ['a', 'b'] as unknown as string }) })).props
        .token,
    ).toBeUndefined()
  })
})

describe('PasswordInput', () => {
  it('should show and hide what was typed', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PasswordInput aria-label="Clave" />)

    expect(screen.getByLabelText('Clave')).toHaveAttribute('type', 'password')
    await user.click(screen.getByRole('button', { name: 'Mostrar la contraseña' }))
    expect(screen.getByLabelText('Clave')).toHaveAttribute('type', 'text')
    expect(screen.getByRole('button', { name: 'Ocultar la contraseña' })).toHaveAttribute('aria-pressed', 'true')
    await user.click(screen.getByRole('button', { name: 'Ocultar la contraseña' }))
    expect(screen.getByLabelText('Clave')).toHaveAttribute('type', 'password')
  })
})

describe('RequestResetForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should ask for the email and say the same whether or not it has an account', async () => {
    const user = userEvent.setup()
    mockedAxios.post.mockResolvedValue({ data: { ok: true } })
    const { container } = renderWithProviders(<RequestResetForm />)
    expect(container.firstChild).toMatchSnapshot()

    await user.type(screen.getByLabelText(/Email/), 'ana@example.com')
    await user.click(screen.getByRole('button', { name: 'Enviar el enlace' }))

    expect(mockedAxios.post).toHaveBeenCalledWith('/api/password-reset/request/', { email: 'ana@example.com' })
    expect(await screen.findByRole('status')).toHaveTextContent('Si ese email tiene cuenta en el panel')
    expect(screen.getByRole('link', { name: 'Volver a entrar' })).toHaveAttribute('href', '/admin/login/')
  })

  it('should explain failures, including too many requests', async () => {
    const user = userEvent.setup()
    mockedAxios.post.mockRejectedValue(new Error('network'))
    renderWithProviders(<RequestResetForm />)

    await user.type(screen.getByLabelText(/Email/), 'ana@example.com')
    await user.click(screen.getByRole('button', { name: 'Enviar el enlace' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('No se ha podido enviar.')
  })
})

describe('ResetPasswordForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should set the new password and then offer to sign in', async () => {
    const user = userEvent.setup()
    mockedAxios.post.mockResolvedValue({ data: { ok: true } })
    const { container } = renderWithProviders(<ResetPasswordForm token="abc" />)
    expect(container.firstChild).toMatchSnapshot()

    await user.type(screen.getByLabelText(/Contraseña nueva/), 'clave-larga-1')
    await user.type(screen.getByLabelText(/Repite/), 'clave-larga-1')
    await user.click(screen.getByRole('button', { name: 'Guardar la contraseña' }))

    expect(mockedAxios.post).toHaveBeenCalledWith('/api/password-reset/confirm/', {
      token: 'abc',
      password: 'clave-larga-1',
      passwordConfirm: 'clave-larga-1',
    })
    expect(await screen.findByRole('status')).toHaveTextContent('ya puedes entrar con tu contraseña nueva')
    expect(screen.getByRole('link', { name: 'Entrar' })).toHaveAttribute('href', '/admin/login/')
  })

  it('should validate the passwords and explain an expired link', async () => {
    const user = userEvent.setup()
    mockedAxios.post.mockRejectedValue(new Error('gone'))
    renderWithProviders(<ResetPasswordForm token="abc" />)

    await user.type(screen.getByLabelText(/Contraseña nueva/), 'corta')
    await user.click(screen.getByRole('button', { name: 'Guardar la contraseña' }))
    expect(
      await screen.findByText('Al menos 10 caracteres', { selector: '.chakra-field__errorText' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Las dos contraseñas no coinciden')).toBeInTheDocument()

    await user.clear(screen.getByLabelText(/Contraseña nueva/))
    await user.type(screen.getByLabelText(/Contraseña nueva/), 'clave-larga-1')
    await user.type(screen.getByLabelText(/Repite/), 'clave-larga-1')
    await user.click(screen.getByRole('button', { name: 'Guardar la contraseña' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('No se ha podido cambiar.')
  })

  it('should ask for a new link when the link has no token', () => {
    renderWithProviders(<ResetPasswordForm />)

    expect(screen.getByText('Este enlace no está completo. Pide uno nuevo.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Pedir un enlace nuevo' })).toHaveAttribute(
      'href',
      '/admin/recuperar-contrasena/',
    )
  })
})
