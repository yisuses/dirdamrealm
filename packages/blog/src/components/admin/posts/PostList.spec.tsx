import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios from 'axios'
import { type Mocked, beforeEach, describe, expect, it, vi } from 'vitest'

import type { AdminPostRow } from '@blog/db/queries/admin/posts'
import { navigation } from '@blog/test/navigation'
import { renderWithProviders } from '@blog/test/render'

import { PostList } from './PostList'

vi.mock('axios', async importOriginal => {
  const actual = await importOriginal<typeof import('axios')>()
  return { ...actual, default: { ...actual.default, post: vi.fn() } }
})
const mockedAxios = axios as Mocked<typeof axios>

const categories = [{ id: '11111111-1111-4111-8111-111111111111', name: 'Viajes' }]
const row = (overrides: Partial<AdminPostRow> = {}): AdminPostRow => ({
  id: 'p1',
  title: 'Viaje a Lisboa',
  updatedAt: '2026-10-22T23:30:00.000Z',
  categories: ['Viajes', 'Música'],
  translations: [
    { locale: 'es', number: 1, status: 'published', scheduledFor: null, hasUnpublishedChanges: true },
    { locale: 'en', number: 2, status: 'draft', scheduledFor: '2026-11-12', hasUnpublishedChanges: false },
  ],
  ...overrides,
})

describe('PostList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should list posts with each language state, categories and Madrid date', () => {
    renderWithProviders(
      <PostList
        posts={[row(), row({ id: 'p2', title: '', categories: [], translations: [{ ...row().translations[1]! }] })]}
        total={2}
        filters={{}}
        categories={categories}
      />,
    )

    expect(screen.getByText('2 entradas')).toBeInTheDocument()
    const [, first, second] = screen.getAllByRole('row')
    expect(within(first!).getByRole('link', { name: 'Viaje a Lisboa' })).toHaveAttribute(
      'href',
      '/admin/entradas/p1/es/',
    )
    expect(within(first!).getByText('Español: Publicada, con cambios sin publicar')).toBeInTheDocument()
    expect(within(first!).getByText('Inglés: Programada para el 12 de noviembre de 2026')).toBeInTheDocument()
    expect(within(first!).getByText('Viajes, Música')).toBeInTheDocument()
    expect(within(first!).getByText('23 oct 2026')).toBeInTheDocument()
    expect(within(second!).getByRole('link', { name: 'Entrada sin título' })).toHaveAttribute(
      'href',
      '/admin/entradas/p2/en/',
    )
    expect(within(second!).getByText('—')).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Páginas' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Quitar filtros' })).not.toBeInTheDocument()
  })

  it('should keep the filters in the form and in the page links', () => {
    const filters = {
      query: 'lisboa',
      locale: 'en' as const,
      status: 'draft' as const,
      categoryId: categories[0]!.id,
      page: 2,
    }
    renderWithProviders(<PostList posts={[row()]} total={80} filters={filters} categories={categories} />)

    expect(screen.getByRole('searchbox')).toHaveValue('lisboa')
    expect(screen.getByLabelText('Estado')).toHaveValue('draft')
    expect(screen.getByLabelText('Idioma')).toHaveValue('en')
    expect(screen.getByLabelText('Categoría')).toHaveValue(categories[0]!.id)
    expect(screen.getByRole('link', { name: 'Quitar filtros' })).toHaveAttribute('href', '/admin/entradas/')
    const query = `q=lisboa&idioma=en&estado=draft&categoria=${categories[0]!.id}`
    expect(screen.getByRole('link', { name: '← Anteriores' })).toHaveAttribute('href', `/admin/entradas/?${query}`)
    expect(screen.getByRole('link', { name: 'Siguientes →' })).toHaveAttribute(
      'href',
      `/admin/entradas/?${query}&pagina=3`,
    )
    expect(screen.getByText('Página 2 de 4')).toBeInTheDocument()
  })

  it('should link plain pages without filters, and stop at the last one', () => {
    renderWithProviders(<PostList posts={[row()]} total={26} filters={{ page: 2 }} categories={categories} />)

    expect(screen.getByRole('link', { name: '← Anteriores' })).toHaveAttribute('href', '/admin/entradas/')
    expect(screen.queryByRole('link', { name: 'Siguientes →' })).not.toBeInTheDocument()
  })

  it('should say when there are no posts, or none matching', () => {
    const { rerender } = renderWithProviders(<PostList posts={[]} total={1} filters={{}} categories={[]} />)
    expect(screen.getByText('Todavía no hay entradas.')).toBeInTheDocument()
    expect(screen.getByText('1 entrada')).toBeInTheDocument()

    rerender(<PostList posts={[]} total={0} filters={{ status: 'published' }} categories={[]} />)
    expect(screen.getByText('Ninguna entrada cumple esos filtros.')).toBeInTheDocument()
  })

  it('should create a post in Spanish and open it, or explain why not', async () => {
    const user = userEvent.setup()
    mockedAxios.post.mockResolvedValueOnce({ data: { id: 'new' } }).mockRejectedValueOnce(new Error('network'))
    const { unmount } = renderWithProviders(<PostList posts={[]} total={0} filters={{}} categories={[]} />)

    await user.click(screen.getByRole('button', { name: 'Nueva entrada' }))
    expect(mockedAxios.post).toHaveBeenCalledWith('/api/admin/posts/', { locale: 'es' })
    expect(navigation.router.push).toHaveBeenCalledWith('/admin/entradas/new/es/')
    unmount()

    renderWithProviders(<PostList posts={[]} total={0} filters={{}} categories={[]} />)
    await user.click(screen.getByRole('button', { name: 'Nueva entrada' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('No se ha podido crear.')
    expect(screen.getByRole('button', { name: 'Nueva entrada' })).toBeEnabled()
  })
})
