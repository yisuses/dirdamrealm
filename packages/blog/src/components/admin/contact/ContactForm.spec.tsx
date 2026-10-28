import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios from 'axios'
import { type Mocked, beforeEach, describe, expect, it, vi } from 'vitest'

import ContactPage from '@blog/app/admin/(panel)/contacto/page'
import { getContactForAdmin } from '@blog/db/queries/admin/contact'
import { renderWithProviders } from '@blog/test/render'

import { ContactForm } from './ContactForm'

vi.mock('axios', async importOriginal => {
  const actual = await importOriginal<typeof import('axios')>()
  return { ...actual, default: { ...actual.default, put: vi.fn() } }
})
vi.mock('@blog/db/queries/admin/contact', () => ({ getContactForAdmin: vi.fn(async () => 'contact') }))
const mockedAxios = axios as Mocked<typeof axios>

const contact = {
  display: true,
  name: 'Emoción Blanca',
  email: 'hola@whemotion.com',
  socialLinks: [
    { network: 'twitter' as const, handle: '@whe', url: 'https://x.com/whe', visible: true },
    { network: 'instagram' as const, handle: '', url: 'https://instagram.com/whe', visible: true },
  ],
}

const save = (user: ReturnType<typeof userEvent.setup>) => user.click(screen.getByRole('button', { name: 'Guardar' }))

describe('ContactForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should load the contact block from the database on its page', async () => {
    expect((await ContactPage()).props.contact).toBe('contact')
    expect(getContactForAdmin).toHaveBeenCalled()
  })

  it('should show the contact data and one group per network', () => {
    const { container } = renderWithProviders(<ContactForm contact={contact} />)

    expect(screen.getByLabelText('Nombre')).toHaveValue('Emoción Blanca')
    expect(screen.getByRole('group', { name: 'Twitter / X' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Instagram' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Subir Twitter / X' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Bajar Instagram' })).toBeDisabled()
    expect(container.firstChild).toMatchSnapshot()
  })

  it('should reorder, hide, remove and add networks, then save them in that order', async () => {
    const user = userEvent.setup()
    mockedAxios.put.mockResolvedValue({ status: 204 })
    renderWithProviders(<ContactForm contact={contact} />)

    await user.click(screen.getByRole('button', { name: 'Bajar Twitter / X' }))
    await user.click(within(screen.getByRole('group', { name: 'Twitter / X' })).getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'Quitar Instagram' }))
    await user.click(screen.getByRole('button', { name: 'Añadir red' }))
    const facebook = screen.getByRole('group', { name: 'Facebook' })
    await user.type(within(facebook).getByLabelText(/Dirección/), 'https://facebook.com/whe')
    await save(user)

    expect(mockedAxios.put).toHaveBeenCalledWith('/api/admin/contact/', {
      ...contact,
      socialLinks: [
        { network: 'twitter', handle: '@whe', url: 'https://x.com/whe', visible: false },
        { network: 'facebook', handle: '', url: 'https://facebook.com/whe', visible: true },
      ],
    })
    expect(await screen.findByRole('status')).toHaveTextContent('Guardado.')
  })

  it('should move a network up and toggle the whole block', async () => {
    const user = userEvent.setup()
    mockedAxios.put.mockResolvedValue({ status: 204 })
    renderWithProviders(<ContactForm contact={contact} />)

    await user.click(screen.getByRole('button', { name: 'Subir Instagram' }))
    await user.click(screen.getByRole('checkbox', { name: 'Mostrar el contacto y las redes en la web' }))
    await save(user)

    expect(mockedAxios.put).toHaveBeenCalledWith('/api/admin/contact/', {
      ...contact,
      display: false,
      socialLinks: [contact.socialLinks[1], contact.socialLinks[0]],
    })
  })

  it('should stop offering networks once all four are used, and say when there are none', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ContactForm contact={{ ...contact, socialLinks: [] }} />)

    expect(screen.getByText('No hay ninguna red. Añade la primera.')).toBeInTheDocument()
    for (let i = 0; i < 4; i++) {
      await user.click(screen.getByRole('button', { name: 'Añadir red' }))
    }

    expect(screen.queryByRole('button', { name: 'Añadir red' })).not.toBeInTheDocument()
  })

  it('should show field errors and the repeated-network error without saving', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ContactForm contact={contact} />)

    await user.clear(screen.getByLabelText('Email'))
    await user.type(screen.getByLabelText('Email'), 'hola')
    await user.selectOptions(within(screen.getByRole('group', { name: 'Instagram' })).getByLabelText('Red'), 'twitter')
    await user.clear(screen.getAllByLabelText(/Dirección/)[0]!)
    await save(user)

    expect(await screen.findByText('Escribe un email válido')).toBeInTheDocument()
    expect(screen.getByText('Escribe la dirección completa, empezando por https://')).toBeInTheDocument()
    expect(screen.getByText('Cada red solo puede aparecer una vez')).toBeInTheDocument()
    expect(mockedAxios.put).not.toHaveBeenCalled()
  })

  it('should show errors for a long name and handle', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ContactForm contact={contact} />)

    await user.type(screen.getByLabelText('Nombre'), 'x'.repeat(80))
    await user.type(screen.getAllByLabelText('Usuario')[0]!, 'x'.repeat(60))
    await save(user)

    expect(await screen.findByText('Máximo 80 caracteres')).toBeInTheDocument()
    expect(screen.getByText('Máximo 60 caracteres')).toBeInTheDocument()
  })

  it('should explain when saving fails', async () => {
    const user = userEvent.setup()
    mockedAxios.put.mockRejectedValue(new Error('network'))
    renderWithProviders(<ContactForm contact={contact} />)

    await save(user)

    expect(await screen.findByRole('status')).toHaveTextContent('No se ha podido guardar. Inténtalo de nuevo.')
  })
})
