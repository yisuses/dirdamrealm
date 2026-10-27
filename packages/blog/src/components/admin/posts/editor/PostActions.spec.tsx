import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios, { AxiosError } from 'axios'
import { type Mocked, afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { EditorTranslation } from '@blog/db/queries/admin/posts'
import { navigation } from '@blog/test/navigation'
import { renderWithProviders } from '@blog/test/render'

import { PostActions } from './PostActions'

vi.mock('axios', async importOriginal => {
  const actual = await importOriginal<typeof import('axios')>()
  return { ...actual, default: { ...actual.default, patch: vi.fn() } }
})
const mockedAxios = axios as Mocked<typeof axios>

const translation = (overrides: Partial<EditorTranslation> = {}): EditorTranslation => ({
  locale: 'es',
  number: 5,
  status: 'draft',
  publishedAt: null,
  scheduledFor: null,
  previewToken: 'tok',
  title: 'Lisboa',
  publishedTitle: null,
  summary: 'Resumen',
  content: { time: 0, version: '', blocks: [] },
  hasUnpublishedChanges: false,
  savedAt: '2026-10-22T10:00:00.000Z',
  ...overrides,
})

function renderActions(overrides: Partial<EditorTranslation> = {}, hasUnpublishedChanges = false, flushOk = true) {
  const flush = vi.fn(async () => flushOk)
  renderWithProviders(
    <PostActions
      postId="p1"
      translation={translation(overrides)}
      hasUnpublishedChanges={hasUnpublishedChanges}
      flush={flush}
    />,
  )
  return { flush }
}

const buttons = () => screen.getAllByRole('button').map(button => button.textContent)

describe('PostActions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    navigation.pathname = '/admin/entradas/p1/es/'
    vi.spyOn(Date, 'now').mockReturnValue(123)
    mockedAxios.patch.mockResolvedValue({ data: { ok: true } })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should publish an unpublished language after confirming, then reload the editor', async () => {
    const user = userEvent.setup()
    const { flush } = renderActions()

    expect(buttons()).toEqual(['Publicar', 'Programar', 'Vista previa', 'Vista previa en el móvil'])
    await user.click(screen.getByRole('button', { name: 'Publicar' }))
    const dialog = await screen.findByRole('alertdialog', { name: '¿Publicar la versión en español?' })
    expect(dialog).toHaveTextContent('Se verá en la web en unos segundos, con la fecha de hoy.')
    await user.click(within(dialog).getByRole('button', { name: 'Sí, publicar' }))

    await waitFor(() => expect(navigation.router.replace).toHaveBeenCalledWith('/admin/entradas/p1/es/?v=123'))
    expect(flush).toHaveBeenCalled()
    expect(mockedAxios.patch).toHaveBeenCalledWith('/api/admin/posts/p1/es/', { action: 'publish' })
  })

  it('should not act when the last changes could not be saved', async () => {
    const user = userEvent.setup()
    renderActions({}, false, false)

    await user.click(screen.getByRole('button', { name: 'Publicar' }))
    await user.click(await screen.findByRole('button', { name: 'Sí, publicar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('No se han podido guardar los últimos cambios.')
    expect(mockedAxios.patch).not.toHaveBeenCalled()
  })

  it("should show the server's reason when an action fails", async () => {
    const user = userEvent.setup()
    mockedAxios.patch.mockRejectedValueOnce(
      Object.assign(new AxiosError('bad'), {
        response: { data: { error: 'Ponle un título antes de publicar' } },
      }),
    )
    renderActions()

    await user.click(screen.getByRole('button', { name: 'Publicar' }))
    await user.click(await screen.findByRole('button', { name: 'Sí, publicar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Ponle un título antes de publicar')
    expect(navigation.router.replace).not.toHaveBeenCalled()
  })

  it('should schedule a day, defaulting to tomorrow, or cancel', async () => {
    const user = userEvent.setup()
    renderActions()

    await user.click(screen.getByRole('button', { name: 'Programar' }))
    let dialog = await screen.findByRole('dialog', { name: 'Programar la publicación' }, { timeout: 3000 })
    const day = within(dialog).getByLabelText('Día')
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    expect(day).toHaveValue(tomorrow.toLocaleDateString('en-CA'))
    expect(day).toHaveAttribute('min', tomorrow.toLocaleDateString('en-CA'))
    await user.click(within(dialog).getByRole('button', { name: 'Cancelar' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument(), { timeout: 3000 })

    await user.click(screen.getByRole('button', { name: 'Programar' }))
    await screen.findByRole('dialog', {}, { timeout: 3000 })
    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument(), { timeout: 3000 })

    await user.click(screen.getByRole('button', { name: 'Programar' }))
    dialog = await screen.findByRole('dialog', {}, { timeout: 3000 })
    fireEvent.change(within(dialog).getByLabelText('Día'), { target: { value: '' } })
    expect(within(dialog).getByRole('button', { name: 'Programar' })).toBeDisabled()
    fireEvent.change(within(dialog).getByLabelText('Día'), { target: { value: '2026-12-01' } })
    await user.click(within(dialog).getByRole('button', { name: 'Programar' }))

    await waitFor(() =>
      expect(mockedAxios.patch).toHaveBeenCalledWith('/api/admin/posts/p1/es/', {
        action: 'schedule',
        date: '2026-12-01',
      }),
    )
  })

  it('should say when a scheduled language will be published, and unschedule it', async () => {
    const user = userEvent.setup()
    renderActions({ scheduledFor: '2026-11-12', locale: 'en' })

    expect(buttons()).toEqual([
      'Publicar',
      'Cambiar el día',
      'Vista previa',
      'Vista previa en el móvil',
      'No programar',
    ])
    expect(screen.getByText(/Se publicará sola el/)).toHaveTextContent(
      'Se publicará sola el 12 de noviembre de 2026 por la mañana.',
    )
    await user.click(screen.getByRole('button', { name: 'Cambiar el día' }))
    expect(within(await screen.findByRole('dialog')).getByLabelText('Día')).toHaveValue('2026-11-12')
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: 'No programar' }))
    await waitFor(() =>
      expect(mockedAxios.patch).toHaveBeenCalledWith('/api/admin/posts/p1/en/', { action: 'schedule', date: null }),
    )
  })

  it('should offer to see a published language on the site and unpublish it', async () => {
    const user = userEvent.setup()
    renderActions({ status: 'published', locale: 'en', number: 7 })

    expect(buttons()).toEqual(['Despublicar'])
    expect(screen.getByRole('link', { name: 'Ver en la web' })).toHaveAttribute('href', '/en/post/7/')
    expect(screen.getByRole('link', { name: 'Ver en la web' })).toHaveAttribute('target', '_blank')
    await user.click(screen.getByRole('button', { name: 'Despublicar' }))
    const dialog = await screen.findByRole('alertdialog', { name: '¿Despublicar la versión en inglés?' })
    expect(dialog).toHaveTextContent('Dejará de verse en la web, pero no se borra')
    await user.click(within(dialog).getByRole('button', { name: 'Cancelar' }))
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: 'Despublicar' }))
    await user.click(await screen.findByRole('button', { name: 'Sí, despublicar' }))
    await waitFor(() =>
      expect(mockedAxios.patch).toHaveBeenCalledWith('/api/admin/posts/p1/en/', { action: 'unpublish' }),
    )
  })

  it('should publish or discard pending changes of a published language', async () => {
    const user = userEvent.setup()
    renderActions({ status: 'published' }, true)

    expect(buttons()).toEqual([
      'Publicar los cambios',
      'Vista previa',
      'Vista previa en el móvil',
      'Descartar los cambios',
      'Despublicar',
    ])
    await user.click(screen.getByRole('button', { name: 'Publicar los cambios' }))
    const publish = await screen.findByRole('alertdialog', { name: '¿Publicar los cambios?' })
    expect(publish).toHaveTextContent('Los lectores verán la versión en español tal y como está ahora')
    await user.click(within(publish).getByRole('button', { name: 'Sí, publicar los cambios' }))
    await waitFor(() =>
      expect(mockedAxios.patch).toHaveBeenCalledWith('/api/admin/posts/p1/es/', { action: 'publish' }),
    )
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: 'Descartar los cambios' }))
    const discard = await screen.findByRole('alertdialog', { name: '¿Descartar los cambios?' })
    expect(discard).toHaveTextContent('Volverá a quedar como se ve ahora en la web.')
    await user.click(within(discard).getByRole('button', { name: 'Sí, descartar' }))
    await waitFor(() =>
      expect(mockedAxios.patch).toHaveBeenLastCalledWith('/api/admin/posts/p1/es/', { action: 'discard' }),
    )
  })

  it('should open the preview in a new tab once everything is saved', async () => {
    const user = userEvent.setup()
    const tab = { location: { href: '' } }
    const open = vi
      .spyOn(window, 'open')
      .mockReturnValueOnce(tab as Window)
      .mockReturnValueOnce(null)
    const { flush } = renderActions({ locale: 'en', number: 9 })

    await user.click(screen.getByRole('button', { name: 'Vista previa' }))
    await waitFor(() => expect(tab.location.href).toBe('/en/vista-previa/9/tok/'))
    expect(open).toHaveBeenCalledWith('', '_blank')
    expect(flush).toHaveBeenCalled()

    // A blocked window is simply skipped.
    await user.click(screen.getByRole('button', { name: 'Vista previa' }))
    expect(open).toHaveBeenCalledTimes(2)
  })

  it('should show the preview inside a phone once everything is saved, and close it', async () => {
    const user = userEvent.setup()
    const { flush } = renderActions({ locale: 'en', number: 9 })

    await user.click(screen.getByRole('button', { name: 'Vista previa en el móvil' }))

    const phone = await screen.findByTitle('La entrada en un móvil')
    expect(flush).toHaveBeenCalled()
    expect(phone).toHaveAttribute('src', '/en/vista-previa/9/tok/')
    await user.click(screen.getByRole('button', { name: 'Cerrar la vista previa' }))
    await waitFor(() => expect(screen.queryByTitle('La entrada en un móvil')).not.toBeInTheDocument(), {
      timeout: 3000,
    })
  })

  it('should close the phone preview with Escape', async () => {
    const user = userEvent.setup()
    renderActions()

    await user.click(screen.getByRole('button', { name: 'Vista previa en el móvil' }))
    await screen.findByRole('dialog', { name: 'Vista previa en el móvil' }, { timeout: 3000 })
    // Focus waits in the dialog, outside the page, so Escape reaches it.
    const dialog = screen.getByRole('dialog', { name: 'Vista previa en el móvil' })
    await waitFor(() => expect(dialog).toContainElement(document.activeElement as HTMLElement), { timeout: 3000 })
    expect(document.activeElement).not.toBe(screen.getByTitle('La entrada en un móvil'))
    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByTitle('La entrada en un móvil')).not.toBeInTheDocument(), {
      timeout: 3000,
    })
  })
})
