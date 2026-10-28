import { ChakraProvider } from '@chakra-ui/react'
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios from 'axios'
import { renderToString } from 'react-dom/server'
import { type Mocked, afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { EditorPost, EditorTranslation } from '@blog/db/queries/admin/posts'
import { navigation } from '@blog/test/navigation'
import { renderWithProviders } from '@blog/test/render'
import { system } from '@blog/themes/chakra.theme'

import { PostEditor } from './PostEditor'

const stubs = vi.hoisted(() => ({ append: vi.fn(), content: { blocks: [] as unknown[] } }))

vi.mock('axios', async importOriginal => {
  const actual = await importOriginal<typeof import('axios')>()
  return { ...actual, default: { ...actual.default, put: vi.fn(), post: vi.fn(), delete: vi.fn() } }
})
vi.mock('./ContentEditor', async () => {
  const { useImperativeHandle, useState } = await import('react')
  return {
    ContentEditor: ({
      onChange,
      pickImage,
      ref,
    }: {
      onChange: (content: unknown) => void
      pickImage: () => Promise<{ name: string } | null>
      ref: React.Ref<unknown>
    }) => {
      useImperativeHandle(ref, () => ({ append: stubs.append }))
      const [picked, setPicked] = useState('')
      return (
        <div>
          <button type="button" onClick={() => onChange({ time: 1, version: '2', blocks: stubs.content.blocks })}>
            Escribir en el editor
          </button>
          <button type="button" onClick={async () => setPicked((await pickImage())?.name ?? 'ninguna')}>
            Imagen en el texto
          </button>
          {picked && <p>Imagen elegida: {picked}</p>}
        </div>
      )
    },
  }
})
vi.mock('./WordImportButton', () => ({
  WordImportButton: ({ onImport }: { onImport: (blocks: unknown[]) => void }) => (
    <button type="button" onClick={() => onImport([{ type: 'paragraph', data: { text: 'De Word' } }])}>
      Importar Word
    </button>
  ),
}))
vi.mock('../../images/ImagePickerDialog', () => ({
  ImagePickerDialog: ({
    open,
    onSelect,
    onClose,
  }: {
    open: boolean
    onSelect: (i: object) => void
    onClose: () => void
  }) =>
    open ? (
      <div role="dialog" aria-label="Elegir una imagen">
        <button
          type="button"
          onClick={() => onSelect({ publicId: 'sol', name: 'Sol', alt: 'Un sol', width: 800, height: 600 })}
        >
          Elegir Sol
        </button>
        <button type="button" onClick={onClose}>
          Cerrar sin elegir
        </button>
      </div>
    ) : null,
}))
const mockedAxios = axios as Mocked<typeof axios>

const now = new Date('2026-10-23T10:00:00.000Z')
const translation = (overrides: Partial<EditorTranslation> = {}): EditorTranslation => ({
  locale: 'es',
  number: 5,
  status: 'draft',
  publishedAt: null,
  scheduledFor: null,
  previewToken: 'tok',
  title: 'Viaje a Lisboa',
  publishedTitle: null,
  summary: 'Una semana',
  content: { time: 0, version: '', blocks: [] },
  hasUnpublishedChanges: false,
  savedAt: '2026-10-21T10:00:00.000Z',
  ...overrides,
})
const post = (overrides: Partial<EditorPost> = {}): EditorPost => ({
  id: 'p1',
  live: false,
  fields: { cover: null, coverImageAuthor: '', coverImageSourceUrl: '', writerId: '', categoryIds: [] },
  translations: { es: translation() },
  ...overrides,
})
const writers = [{ id: '11111111-1111-4111-8111-111111111111', name: 'José Madrid' }]
const categories = [
  { id: '22222222-2222-4222-8222-222222222222', name: 'Viajes' },
  { id: '33333333-3333-4333-8333-333333333333', name: 'Deportes' },
]

function renderEditor(value = post(), locale: 'es' | 'en' = 'es') {
  return renderWithProviders(<PostEditor post={value} locale={locale} writers={writers} categories={categories} />)
}

const status = () => screen.getAllByRole('status')[0]!
const savedPayload = () => mockedAxios.put.mock.calls.at(-1)![1] as Record<string, unknown>

describe('PostEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(now)
    stubs.content.blocks = []
    mockedAxios.put.mockResolvedValue({ data: { savedAt: now.toISOString() } })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should show the saved post with its languages and when it was saved', () => {
    renderEditor(post({ translations: { es: translation(), en: translation({ locale: 'en', status: 'published' }) } }))

    const tabs = screen.getByRole('navigation', { name: 'Idiomas' })
    expect(within(tabs).getByRole('link', { name: /Español/ })).toHaveAttribute('aria-current', 'page')
    expect(within(tabs).getByRole('link', { name: /Español/ })).toHaveTextContent('Borrador')
    expect(within(tabs).getByRole('link', { name: /Inglés/ })).toHaveAttribute('href', '/admin/entradas/p1/en/')
    expect(within(tabs).getByRole('link', { name: /Inglés/ })).toHaveTextContent('Publicada')
    expect(screen.getByRole('heading', { name: 'Viaje a Lisboa' })).toBeInTheDocument()
    expect(status()).toHaveTextContent('Guardado hace 2 días')
    expect(screen.getByText('Obligatorio para publicar.')).toBeInTheDocument()
    expect(screen.queryByText(/son las mismas en los dos idiomas/)).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: '← Todas las entradas' })).toHaveAttribute('href', '/admin/entradas/')
  })

  it('should keep the time since saving up to date', () => {
    vi.useFakeTimers({ toFake: ['Date', 'setInterval', 'clearInterval'] })
    vi.setSystemTime(now)
    renderEditor(post({ translations: { es: translation({ savedAt: '2026-10-23T09:59:55.000Z' }) } }))
    expect(status()).toHaveTextContent('Guardado ahora mismo')

    act(() => vi.advanceTimersByTime(30_000))

    expect(status()).toHaveTextContent('Guardado hace 35 segundos')
  })

  it('should say only "Guardado" on the server, where the time is not known yet', () => {
    const html = renderToString(
      <ChakraProvider value={system}>
        <PostEditor post={post()} locale="es" writers={writers} categories={categories} />
      </ChakraProvider>,
    )

    expect(html).toContain('>Guardado</p>')
  })

  it('should save every field a moment after editing, without counting it as unpublished changes', async () => {
    const user = userEvent.setup()
    renderEditor(post({ translations: { es: translation({ title: '' }) } }))
    expect(screen.getByRole('heading', { name: 'Entrada sin título' })).toBeInTheDocument()

    await user.type(screen.getByLabelText('Título'), 'Oporto')
    fireEvent.change(screen.getByLabelText('Resumen'), { target: { value: 'Tres días' } })
    fireEvent.change(screen.getByLabelText('Autor de la foto de portada'), { target: { value: 'Ana' } })
    fireEvent.change(screen.getByLabelText('Enlace a la foto original'), { target: { value: 'https://x.com/a' } })
    await user.selectOptions(screen.getByLabelText('Firma'), writers[0]!.id)
    await user.click(screen.getByText('Viajes'))
    expect(status()).toHaveTextContent('Cambios sin guardar…')

    await waitFor(() => expect(mockedAxios.put).toHaveBeenCalledTimes(1), { timeout: 4000 })
    expect(mockedAxios.put).toHaveBeenCalledWith('/api/admin/posts/p1/es/', {
      title: 'Oporto',
      summary: 'Tres días',
      content: { time: 0, version: '', blocks: [] },
      cover: null,
      coverImageAuthor: 'Ana',
      coverImageSourceUrl: 'https://x.com/a',
      writerId: writers[0]!.id,
      categoryIds: [categories[0]!.id],
    })
    await waitFor(() => expect(status()).toHaveTextContent('Guardado ahora mismo'))
    expect(screen.getByRole('link', { name: /Español/ })).toHaveTextContent('Borrador')
  })

  it('should not save while something is invalid, and say what', async () => {
    renderEditor()

    fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'x'.repeat(201) } })
    fireEvent.change(screen.getByLabelText('Enlace a la foto original'), { target: { value: 'no es una web' } })

    expect(await screen.findByText('Máximo 200 caracteres')).toBeInTheDocument()
    expect(screen.getByText('Escribe la dirección completa, empezando por https://')).toBeInTheDocument()
    expect(status()).toHaveTextContent('No se guarda hasta corregir lo marcado en rojo')
    await new Promise(resolve => setTimeout(resolve, 1800))
    expect(mockedAxios.put).not.toHaveBeenCalled()
  })

  it('should save the text from the editor, and say when it is too long', async () => {
    const user = userEvent.setup()
    renderEditor()

    stubs.content.blocks = [{ type: 'paragraph', data: { text: 'Hola' } }]
    await user.click(screen.getByRole('button', { name: 'Escribir en el editor' }))
    await waitFor(() => expect(mockedAxios.put).toHaveBeenCalled(), { timeout: 4000 })
    expect(savedPayload().content).toEqual({ time: 1, version: '2', blocks: stubs.content.blocks })

    stubs.content.blocks = [{ type: 'paragraph', data: { text: 'x'.repeat(1024 * 1024) } }]
    await user.click(screen.getByRole('button', { name: 'Escribir en el editor' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('El texto es demasiado largo')
  })

  it('should say how long the text takes to read, and keep it up to date while writing', async () => {
    const user = userEvent.setup()
    renderEditor()
    expect(screen.queryByText(/min de lectura/)).not.toBeInTheDocument()

    stubs.content.blocks = [{ type: 'paragraph', data: { text: 'palabra '.repeat(450) } }]
    await user.click(screen.getByRole('button', { name: 'Escribir en el editor' }))
    expect(screen.getByText('3 min de lectura')).toBeInTheDocument()
  })

  it('should warn that publishing changes the address, and mark edits of a published post as pending', async () => {
    const user = userEvent.setup()
    renderEditor(
      post({
        live: true,
        translations: { es: translation({ status: 'published', publishedTitle: 'Viaje a Lisboa' }) },
      }),
    )
    expect(screen.getByText(/son las mismas en los dos idiomas/)).toBeInTheDocument()
    expect(screen.getByText('Obligatorio para publicar.')).toBeInTheDocument()

    await user.type(screen.getByLabelText('Título'), ' y Oporto')

    expect(
      screen.getByText(/la dirección de la entrada cambiará a …\/post\/5\/viaje-a-lisboa-y-oporto\//),
    ).toBeInTheDocument()
    await waitFor(
      () =>
        expect(screen.getByRole('link', { name: /Español/ })).toHaveTextContent('Publicada, con cambios sin publicar'),
      {
        timeout: 4000,
      },
    )
    expect(
      screen.getByText('Los lectores siguen viendo la versión publicada hasta que publiques los cambios.'),
    ).toBeInTheDocument()
  })

  it('should count saves of an unpublished language as pending when the post is on the site', async () => {
    const user = userEvent.setup()
    renderEditor(post({ live: true }))

    await user.type(screen.getByLabelText('Resumen'), '!')
    await waitFor(() => expect(mockedAxios.put).toHaveBeenCalled(), { timeout: 4000 })
    expect(screen.getByRole('link', { name: /Español/ })).toHaveTextContent('Borrador')
  })

  it('should choose a cover and images for the text from the library', async () => {
    const user = userEvent.setup()
    renderEditor()

    await user.click(screen.getByRole('button', { name: 'Elegir la portada' }))
    await user.click(screen.getByRole('button', { name: 'Cerrar sin elegir' }))
    expect(screen.getByRole('button', { name: 'Elegir la portada' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Elegir la portada' }))
    await user.click(screen.getByRole('button', { name: 'Elegir Sol' }))
    expect(screen.getByLabelText('Descripción de la portada')).toHaveValue('Un sol')
    await waitFor(() => expect(mockedAxios.put).toHaveBeenCalled(), { timeout: 4000 })
    expect(savedPayload().cover).toEqual({ publicId: 'sol', width: 800, height: 600, alt: 'Un sol' })
    fireEvent.change(screen.getByLabelText('Descripción de la portada'), { target: { value: 'Atardecer' } })
    await waitFor(() => expect(savedPayload().cover).toMatchObject({ alt: 'Atardecer' }), { timeout: 4000 })
    await user.click(screen.getByRole('button', { name: 'Quitar la portada' }))
    await waitFor(() => expect(savedPayload().cover).toBeNull(), { timeout: 4000 })

    await user.click(screen.getByRole('button', { name: 'Imagen en el texto' }))
    await user.click(screen.getByRole('button', { name: 'Elegir Sol' }))
    expect(await screen.findByText('Imagen elegida: Sol')).toBeInTheDocument()
  })

  it('should add a Word document to the end of the text', async () => {
    const user = userEvent.setup()
    renderEditor()

    await user.click(screen.getByRole('button', { name: 'Importar Word' }))

    expect(stubs.append).toHaveBeenCalledWith([{ type: 'paragraph', data: { text: 'De Word' } }])
  })

  it('should create the missing language and open it, or explain why not', async () => {
    const user = userEvent.setup()
    mockedAxios.post.mockResolvedValueOnce({}).mockRejectedValueOnce(new Error('network'))
    renderEditor(post({ translations: { en: translation({ locale: 'en' }) } }), 'en')

    await user.click(screen.getByRole('button', { name: '+ Crear la versión en español' }))
    expect(mockedAxios.post).toHaveBeenCalledWith('/api/admin/posts/p1/es/')
    expect(navigation.router.push).toHaveBeenCalledWith('/admin/entradas/p1/es/')

    await user.click(screen.getByRole('button', { name: '+ Crear la versión en español' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('No se ha podido crear.')
  })

  it('should delete the post after confirming, or explain why not', async () => {
    const user = userEvent.setup()
    mockedAxios.delete.mockRejectedValueOnce(new Error('network')).mockResolvedValueOnce({})
    renderEditor()

    await user.click(screen.getByRole('button', { name: 'Borrar la entrada' }))
    const dialog = await screen.findByRole('alertdialog', { name: '¿Borrar la entrada?' })
    expect(dialog).toHaveTextContent('Se borra en los dos idiomas y deja de verse en la web.')
    await user.click(within(dialog).getByRole('button', { name: 'Cancelar' }))
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: 'Borrar la entrada' }))
    await user.click(await screen.findByRole('button', { name: 'Sí, borrar' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('No se ha podido borrar.')
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: 'Borrar la entrada' }))
    await user.click(await screen.findByRole('button', { name: 'Sí, borrar' }))
    await waitFor(() => expect(navigation.router.push).toHaveBeenCalledWith('/admin/entradas/'))
    expect(mockedAxios.delete).toHaveBeenCalledWith('/api/admin/posts/p1/')
    expect(navigation.router.refresh).toHaveBeenCalled()
  })
})
