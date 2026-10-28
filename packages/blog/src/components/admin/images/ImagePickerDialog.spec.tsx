import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios from 'axios'
import { type Mocked, beforeEach, describe, expect, it, vi } from 'vitest'

import { renderWithProviders } from '@blog/test/render'

import { ImagePickerDialog } from './ImagePickerDialog'

vi.mock('axios', async importOriginal => {
  const actual = await importOriginal<typeof import('axios')>()
  return { ...actual, default: { ...actual.default, get: vi.fn() } }
})
const mockedAxios = axios as Mocked<typeof axios>

const image = {
  publicId: 'sol',
  name: 'Sol',
  alt: '',
  width: 10,
  height: 10,
  format: 'png',
  bytes: 1,
  createdAt: '2026-10-20T12:00:00Z',
}

describe('ImagePickerDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME', 'demo')
    mockedAxios.get.mockResolvedValue({ data: { images: [image], total: 1, nextCursor: null } })
  })

  it('should pick an image from the library, which then has no page header', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    renderWithProviders(<ImagePickerDialog open onSelect={onSelect} onClose={vi.fn()} />)

    expect(await screen.findByRole('dialog', { name: 'Elegir una imagen' })).toBeInTheDocument()
    expect(screen.getByText('Pulsa la imagen que quieras usar, o sube una nueva.')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Imágenes' })).not.toBeInTheDocument()
    await user.click(await screen.findByRole('button', { name: 'Elegir Sol' }))
    expect(onSelect).toHaveBeenCalledWith(image)
  })

  it('should close without choosing, under its own title', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderWithProviders(<ImagePickerDialog open title="Portada" onSelect={vi.fn()} onClose={onClose} />)

    await screen.findByRole('dialog', { name: 'Portada' })
    await user.click(screen.getByRole('button', { name: 'Cerrar sin elegir' }))
    await waitFor(() => expect(onClose).toHaveBeenCalled())
  })

  it('should not load the library while closed', () => {
    renderWithProviders(<ImagePickerDialog open={false} onSelect={vi.fn()} onClose={vi.fn()} />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(mockedAxios.get).not.toHaveBeenCalled()
  })
})
