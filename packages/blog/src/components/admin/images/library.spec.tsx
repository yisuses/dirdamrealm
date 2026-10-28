import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios from 'axios'
import { type Mocked, afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import EditImagePage from '@blog/app/admin/(panel)/imagenes/[publicId]/page'
import ImagesPage from '@blog/app/admin/(panel)/imagenes/page'
import { getImage } from '@blog/core/cloudinary/library'
import type { LibraryImage } from '@blog/core/cloudinary/libraryImage'
import type { ImageUsage } from '@blog/db/queries/admin/images'
import { navigation } from '@blog/test/navigation'
import { createTestQueryClient, renderWithProviders } from '@blog/test/render'

import { ImageForm } from './ImageForm'
import { ImageLibrary } from './ImageLibrary'
import { libraryQueryKey } from './images'

vi.mock('axios', async importOriginal => {
  const actual = await importOriginal<typeof import('axios')>()
  return {
    ...actual,
    default: { ...actual.default, get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  }
})
vi.mock('@blog/core/cloudinary/library', () => ({ getImage: vi.fn() }))
vi.mock('@blog/db/queries/admin/images', () => ({ findImageUsage: vi.fn(async () => ['usage']) }))
const mockedAxios = axios as Mocked<typeof axios>

const image = (publicId: string, overrides: Partial<LibraryImage> = {}): LibraryImage => ({
  publicId,
  name: publicId.replace(/_/g, ' '),
  alt: 'Descripción',
  width: 1200,
  height: 800,
  format: 'png',
  bytes: 396_526,
  createdAt: '2026-10-20T12:00:00Z',
  ...overrides,
})
const page = (images: LibraryImage[], total: number, nextCursor: string | null = null) => ({
  data: { images, total, nextCursor },
})
const png = (name: string, size = 10) => new File(['x'.repeat(size)], name, { type: 'image/png' })
const uploaded = (publicId: string, name: string) => ({
  data: {
    public_id: publicId,
    width: 1,
    height: 1,
    format: 'png',
    bytes: 1,
    created_at: 'x',
    context: { custom: { name } },
  },
})

describe('image pages', () => {
  it('should render the library and 404 for unknown or malformed ids', async () => {
    expect(ImagesPage().type).toBe(ImageLibrary)

    vi.mocked(getImage).mockResolvedValueOnce(image('sol'))
    expect((await EditImagePage({ params: Promise.resolve({ publicId: 'sol' }) })).props).toEqual({
      image: image('sol'),
      usage: ['usage'],
    })
    const notFound = expect.objectContaining({ digest: expect.stringContaining('NEXT_HTTP_ERROR_FALLBACK;404') })
    await expect(EditImagePage({ params: Promise.resolve({ publicId: 'nope' }) })).rejects.toMatchObject(notFound)
    await expect(EditImagePage({ params: Promise.resolve({ publicId: 'a/b' }) })).rejects.toMatchObject(notFound)
  })
})

describe('ImageLibrary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME', 'demo')
    URL.createObjectURL = vi.fn((file: File) => `blob:${file.name}`)
    URL.revokeObjectURL = vi.fn()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('should list images, flag missing descriptions and load more', async () => {
    const user = userEvent.setup()
    mockedAxios.get
      .mockResolvedValueOnce(page([image('portada_4'), image('sin_texto', { alt: '' })], 3, 'next'))
      .mockResolvedValueOnce(page([image('ultima')], 3))
    const { container } = renderWithProviders(<ImageLibrary />)

    expect(screen.getByLabelText('Cargando imágenes')).toBeInTheDocument()
    expect(await screen.findByText('3 imágenes')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'portada 4' })).toHaveAttribute('href', '/admin/imagenes/portada_4/')
    expect(screen.getAllByText('Sin descripción')).toHaveLength(1)
    expect(container.firstChild).toMatchSnapshot()

    await user.click(screen.getByRole('button', { name: 'Cargar más imágenes' }))
    expect(await screen.findByRole('link', { name: 'ultima' })).toBeInTheDocument()
    expect(mockedAxios.get).toHaveBeenLastCalledWith('/api/admin/images/', { params: { q: undefined, cursor: 'next' } })
    expect(screen.queryByRole('button', { name: 'Cargar más imágenes' })).not.toBeInTheDocument()
  })

  it('should search, say when nothing matches and go back to every image', async () => {
    const user = userEvent.setup()
    mockedAxios.get
      .mockResolvedValueOnce(page([], 0))
      .mockResolvedValueOnce(page([image('portada_4')], 1))
      .mockResolvedValueOnce(page([image('portada_4'), image('portada_5')], 2))
      .mockResolvedValueOnce(page([], 0))
    renderWithProviders(<ImageLibrary />)

    expect(await screen.findByText('Todavía no hay imágenes.')).toBeInTheDocument()
    await user.type(screen.getByRole('searchbox'), 'portada')
    await user.click(screen.getByRole('button', { name: 'Buscar' }))
    expect(await screen.findByText('1 imagen encontrada')).toBeInTheDocument()
    expect(mockedAxios.get).toHaveBeenLastCalledWith('/api/admin/images/', {
      params: { q: 'portada', cursor: undefined },
    })

    await user.clear(screen.getByRole('searchbox'))
    await user.type(screen.getByRole('searchbox'), ' portadas ')
    await user.click(screen.getByRole('button', { name: 'Buscar' }))
    expect(await screen.findByText('2 imágenes encontradas')).toBeInTheDocument()

    await user.clear(screen.getByRole('searchbox'))
    await user.type(screen.getByRole('searchbox'), 'zzz')
    await user.click(screen.getByRole('button', { name: 'Buscar' }))
    expect(await screen.findByText('No hay ninguna imagen que se llame «zzz».')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Ver todas' }))
    expect(await screen.findByText('Todavía no hay imágenes.')).toBeInTheDocument()
    expect(screen.getByRole('searchbox')).toHaveValue('')
  })

  it('should show why the library could not load', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('network'))
    renderWithProviders(<ImageLibrary />)

    expect(await screen.findByRole('alert')).toHaveTextContent('No se han podido cargar las imágenes.')
  })

  it('should upload chosen files with their names, skipping what cannot be uploaded', async () => {
    const user = userEvent.setup({ applyAccept: false })
    const queryClient = createTestQueryClient()
    mockedAxios.get.mockResolvedValueOnce(page([image('vieja')], 1))
    mockedAxios.post.mockImplementation(async url => {
      if (url === '/api/admin/images/signature/') {
        return { data: { url: 'https://api.cloudinary.com/upload', fields: { signature: 's' } } }
      }
      return uploaded('sol_1', 'Sol de tarde')
    })
    renderWithProviders(<ImageLibrary />, { queryClient })
    await screen.findByText('1 imágenes')

    await user.upload(screen.getByLabelText('Elegir imágenes para subir'), [
      png('sol_de-tarde.png'),
      new File(['x'], 'notas.txt', { type: 'text/plain' }),
      png('enorme.png', 11 * 1024 * 1024),
    ])
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText('No es una imagen.')).toBeInTheDocument()
    expect(within(dialog).getByText('Pesa 11 MB: el máximo es 10 MB.')).toBeInTheDocument()
    expect(dialog.querySelector('img')).toHaveAttribute('src', 'blob:sol_de-tarde.png')

    await user.click(within(dialog).getAllByRole('button', { name: 'Quitar de la lista' })[2]!)
    const name = within(dialog).getByLabelText(/Nombre/)
    expect(name).toHaveValue('sol de tarde')
    await user.clear(name)
    await user.click(within(dialog).getByRole('button', { name: 'Subir 1 imagen' }))
    expect(await within(dialog).findByText('Escribe un nombre')).toBeInTheDocument()
    expect(mockedAxios.post).not.toHaveBeenCalled()

    await user.type(name, 'Sol de tarde')
    await user.type(within(dialog).getByLabelText('Descripción'), 'El sol cayendo')
    await user.click(within(dialog).getByRole('button', { name: 'Subir 1 imagen' }))

    expect(await within(dialog).findByText('Subida: Sol de tarde')).toBeInTheDocument()
    expect(mockedAxios.post).toHaveBeenCalledWith('/api/admin/images/signature/', {
      name: 'Sol de tarde',
      alt: 'El sol cayendo',
    })
    // Still behind the open dialog, so hidden from the accessibility tree.
    expect(await screen.findByRole('link', { name: 'Sol de tarde', hidden: true })).toBeInTheDocument()
    expect(screen.getByText('2 imágenes')).toBeInTheDocument()

    await user.click(within(dialog).getByRole('button', { name: 'Cerrar' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:sol_de-tarde.png')
    expect(queryClient.getQueryData(libraryQueryKey(''))).toBeDefined()
  })

  it('should let a failed upload be retried, and count several files', async () => {
    const user = userEvent.setup()
    mockedAxios.get.mockResolvedValueOnce(page([], 0))
    mockedAxios.post.mockRejectedValue(new Error('network'))
    renderWithProviders(<ImageLibrary />)
    await screen.findByText('Todavía no hay imágenes.')

    await user.upload(screen.getByLabelText('Elegir imágenes para subir'), [png('a.png'), png('b.png')])
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Subir 2 imágenes' }))

    expect(await within(dialog).findAllByText('No se ha podido subir. Vuelve a probar.')).toHaveLength(2)
    expect(within(dialog).getByRole('button', { name: 'Subir 2 imágenes' })).toBeEnabled()

    for (const button of within(dialog).getAllByRole('button', { name: 'Quitar de la lista' })) {
      await user.click(button)
    }
    expect(within(dialog).getByText('No queda ninguna imagen por subir.')).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Cerrar' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('should show progress while uploading and cancel before starting', async () => {
    const user = userEvent.setup()
    mockedAxios.get.mockResolvedValueOnce(page([], 0))
    let finish: (value: unknown) => void = () => undefined
    mockedAxios.post.mockImplementation(async (url, _data, config) => {
      if (url === '/api/admin/images/signature/') {
        return { data: { url: 'https://api.cloudinary.com/upload', fields: {} } }
      }
      config!.onUploadProgress!({ loaded: 1, total: 2 } as never)
      return new Promise(resolve => {
        finish = resolve
      })
    })
    renderWithProviders(<ImageLibrary />)
    await screen.findByText('Todavía no hay imágenes.')

    await user.upload(screen.getByLabelText('Elegir imágenes para subir'), [png('a.png')])
    let dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Cancelar' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())

    await user.upload(screen.getByLabelText('Elegir imágenes para subir'), [png('a.png')])
    dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Subir 1 imagen' }))
    expect(await within(dialog).findByRole('progressbar')).toHaveAttribute('aria-valuenow', '50')
    expect(within(dialog).getByLabelText('Subiendo a')).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: 'Cancelar' })).toBeDisabled()
    await user.keyboard('{Escape}')
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    finish(uploaded('a_1', 'a'))
    expect(await within(dialog).findByText('Subida: a')).toBeInTheDocument()
    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('should take files dropped on the drop zone, and ignore other drags', async () => {
    mockedAxios.get.mockResolvedValueOnce(page([], 0))
    renderWithProviders(<ImageLibrary />)
    const zone = screen.getByTestId('drop-zone')

    fireEvent.dragOver(zone, { dataTransfer: { types: ['text/plain'] } })
    expect(screen.queryByText('Suelta las imágenes para subirlas')).not.toBeInTheDocument()
    fireEvent.dragOver(zone, { dataTransfer: { types: ['Files'] } })
    expect(screen.getByText('Suelta las imágenes para subirlas')).toBeInTheDocument()
    fireEvent.dragLeave(zone)
    expect(screen.queryByText('Suelta las imágenes para subirlas')).not.toBeInTheDocument()

    fireEvent.drop(zone, { dataTransfer: { types: ['Files'], files: [] } })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    fireEvent.drop(zone, { dataTransfer: { types: ['Files'], files: [png('a.png')] } })
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
  })

  it('should open the file picker from both buttons', async () => {
    const user = userEvent.setup()
    mockedAxios.get.mockResolvedValueOnce(page([], 0))
    renderWithProviders(<ImageLibrary />)
    const click = vi.spyOn(screen.getByLabelText('Elegir imágenes para subir'), 'click')

    await user.click(screen.getByRole('button', { name: 'Subir imágenes' }))
    await user.click(screen.getByRole('button', { name: 'pulsa para elegirlas' }))
    expect(click).toHaveBeenCalledTimes(2)
  })
})

describe('ImageForm', () => {
  const usage: ImageUsage[] = [
    { number: 50, locale: 'es', title: 'Águila y gallina', status: 'published', cover: true, content: false },
    { number: 49, locale: 'en', title: 'Eagle and chicken', status: 'draft', cover: true, content: true },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME', 'demo')
  })

  it('should show the image, its details and where it is used, without offering to delete it', () => {
    renderWithProviders(<ImageForm image={image('aguila')} usage={usage} />)

    expect(screen.getByRole('heading', { name: 'aguila' })).toBeInTheDocument()
    expect(screen.getByText('1200 × 800 píxeles')).toBeInTheDocument()
    expect(screen.getByText('387,2 KB')).toBeInTheDocument()
    expect(screen.getByText('20 de octubre de 2026')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Águila y gallina' })).toHaveAttribute('href', '/post/50/')
    expect(screen.getByText('(inglés, borrador, en la portada y texto)')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Eagle and chicken' })).not.toBeInTheDocument()
    expect(screen.getByText('Para borrarla, quítala antes de esas entradas.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Borrar la imagen' })).not.toBeInTheDocument()
  })

  it('should link published English posts and talk about one post in singular', () => {
    renderWithProviders(
      <ImageForm image={image('aguila')} usage={[{ ...usage[1]!, status: 'published', cover: false }]} />,
    )

    expect(screen.getByRole('link', { name: 'Eagle and chicken' })).toHaveAttribute('href', '/en/post/49/')
    expect(screen.getByText('(inglés, publicada, en la texto)')).toBeInTheDocument()
    expect(screen.getByText('Para borrarla, quítala antes de esa entrada.')).toBeInTheDocument()
  })

  it('should save the name and description', async () => {
    const user = userEvent.setup()
    mockedAxios.patch.mockResolvedValueOnce({ data: image('aguila', { name: 'Águila real' }) })
    renderWithProviders(<ImageForm image={image('aguila')} usage={[]} />)

    await user.clear(screen.getByLabelText(/Nombre/))
    await user.type(screen.getByLabelText(/Nombre/), 'Águila real')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(await screen.findByRole('status')).toHaveTextContent('Guardado.')
    expect(mockedAxios.patch).toHaveBeenCalledWith('/api/admin/images/aguila/', {
      name: 'Águila real',
      alt: 'Descripción',
    })
    expect(navigation.router.refresh).toHaveBeenCalled()
  })

  it('should validate the form and show save errors', async () => {
    const user = userEvent.setup()
    mockedAxios.patch.mockRejectedValueOnce(new Error('network'))
    renderWithProviders(<ImageForm image={image('aguila')} usage={[]} />)

    await user.clear(screen.getByLabelText(/Nombre/))
    await user.click(screen.getByRole('button', { name: 'Guardar' }))
    expect(await screen.findByText('Escribe un nombre')).toBeInTheDocument()

    await user.type(screen.getByLabelText(/Nombre/), 'x')
    await user.click(screen.getByLabelText('Descripción'))
    await user.paste('y'.repeat(301))
    await user.click(screen.getByRole('button', { name: 'Guardar' }))
    expect(await screen.findByText('Máximo 300 caracteres')).toBeInTheDocument()

    await user.clear(screen.getByLabelText('Descripción'))
    await user.click(screen.getByRole('button', { name: 'Guardar' }))
    expect(await screen.findByRole('status')).toHaveTextContent('No se ha podido guardar.')
  })

  it('should delete an unused image after confirming', async () => {
    const user = userEvent.setup()
    mockedAxios.delete.mockResolvedValueOnce({})
    renderWithProviders(<ImageForm image={image('aguila')} usage={[]} />)

    expect(screen.getByText('En ninguna entrada.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Borrar la imagen' }))
    await user.click(await screen.findByRole('button', { name: 'Cancelar' }))
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: 'Borrar la imagen' }))
    await user.click(await screen.findByRole('button', { name: 'Sí, borrar' }))

    await waitFor(() => expect(navigation.router.push).toHaveBeenCalledWith('/admin/imagenes/'))
    expect(mockedAxios.delete).toHaveBeenCalledWith('/api/admin/images/aguila/')
  })

  it('should explain why a delete failed', async () => {
    const user = userEvent.setup()
    mockedAxios.delete.mockRejectedValueOnce(new Error('network'))
    renderWithProviders(<ImageForm image={image('aguila')} usage={[]} />)

    await user.click(screen.getByRole('button', { name: 'Borrar la imagen' }))
    await user.click(await screen.findByRole('button', { name: 'Sí, borrar' }))

    expect(await screen.findByRole('status')).toHaveTextContent('No se ha podido borrar.')
    expect(navigation.router.push).not.toHaveBeenCalled()
  })
})
