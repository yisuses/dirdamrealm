import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios from 'axios'
import { type Mocked, beforeEach, describe, expect, it, vi } from 'vitest'

import CommentsPage from '@blog/app/admin/(panel)/comentarios/page'
import type { AdminComment } from '@blog/db/queries/admin/comments'
import { listCommentsForAdmin } from '@blog/db/queries/admin/comments'
import { navigation } from '@blog/test/navigation'
import { renderWithProviders } from '@blog/test/render'

import { CommentList } from './CommentList'

vi.mock('axios', async importOriginal => {
  const actual = await importOriginal<typeof import('axios')>()
  return { ...actual, default: { ...actual.default, delete: vi.fn() } }
})
vi.mock('@blog/db/queries/admin/comments', () => ({
  listCommentsForAdmin: vi.fn(async () => ({ comments: ['comment'], total: 1 })),
}))
const mockedAxios = axios as Mocked<typeof axios>

const comment = (id: number, overrides: Partial<AdminComment> = {}): AdminComment => ({
  id,
  author: 'Eduardo ',
  text: 'Un artículo\nmuy bueno',
  createdAt: '2026-10-21T15:42:00.000Z',
  post: { id: 'post', number: 337, locale: 'es', title: 'Tapestry', published: true },
  ...overrides,
})

describe('comments page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should read the search and the page from the address, ignoring invalid values', async () => {
    const page = (await CommentsPage({ searchParams: Promise.resolve({ q: ' madrid ', pagina: '3' }) })).props
    expect(page).toEqual({ comments: ['comment'], total: 1, query: 'madrid', page: 3 })
    expect(listCommentsForAdmin).toHaveBeenCalledWith({ query: 'madrid', page: 3 })

    const fallback = (await CommentsPage({ searchParams: Promise.resolve({ q: ['a', 'b'], pagina: ['2'] }) })).props
    expect(fallback).toMatchObject({ query: '', page: 1 })
    expect(
      (await CommentsPage({ searchParams: Promise.resolve({ q: 'x'.repeat(150), pagina: '-4' }) })).props,
    ).toMatchObject({
      query: 'x'.repeat(100),
      page: 1,
    })
    expect((await CommentsPage({ searchParams: Promise.resolve({ pagina: '99999' }) })).props.page).toBe(1000)
  })
})

describe('CommentList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should show each comment with its post, linking to it on the site', () => {
    renderWithProviders(
      <CommentList
        comments={[
          comment(1),
          comment(2, { author: 'Bob', post: { id: 'p2', number: 11, locale: 'en', title: 'Hello', published: true } }),
          comment(3, {
            author: 'Carla',
            post: { id: 'p3', number: 20, locale: 'es', title: 'Borrador', published: false },
          }),
        ]}
        total={3}
        query=""
        page={1}
      />,
    )

    expect(screen.getByText('3 comentarios')).toBeInTheDocument()
    const [, first, second, third] = screen.getAllByRole('row')
    expect(within(first!).getByText('Eduardo')).toBeInTheDocument()
    expect(within(first!).getByRole('link', { name: 'Tapestry' })).toHaveAttribute('href', '/post/337/#comment-1')
    expect(within(first!).getByText('21 oct 2026, 17:42')).toBeInTheDocument()
    expect(within(second!).getByRole('link', { name: 'Hello' })).toHaveAttribute('href', '/en/post/11/#comment-2')
    expect(within(third!).getByText('Borrador (no publicada)')).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Páginas' })).not.toBeInTheDocument()
    expect(screen.getByRole('search')).toHaveAttribute('action', '/admin/comentarios/')
  })

  it('should say when there are no comments, or none matching the search', () => {
    const { rerender } = renderWithProviders(<CommentList comments={[]} total={0} query="" page={1} />)
    expect(screen.getByText('Todavía no hay comentarios.')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Ver todos' })).not.toBeInTheDocument()

    rerender(<CommentList comments={[]} total={1} query="zzz" page={1} />)
    expect(screen.getByText('Ningún comentario coincide con la búsqueda.')).toBeInTheDocument()
    expect(screen.getByText('1 comentario')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver todos' })).toHaveAttribute('href', '/admin/comentarios/')
  })

  it('should link the other pages, keeping the search', () => {
    const { rerender } = renderWithProviders(<CommentList comments={[comment(1)]} total={60} query="madrid" page={2} />)

    expect(screen.getByText('Página 2 de 3')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '← Más nuevos' })).toHaveAttribute('href', '/admin/comentarios/?q=madrid')
    expect(screen.getByRole('link', { name: 'Más antiguos →' })).toHaveAttribute(
      'href',
      '/admin/comentarios/?q=madrid&pagina=3',
    )

    rerender(<CommentList comments={[comment(1)]} total={60} query="" page={3} />)
    expect(screen.getByRole('link', { name: '← Más nuevos' })).toHaveAttribute('href', '/admin/comentarios/?pagina=2')
    expect(screen.queryByRole('link', { name: 'Más antiguos →' })).not.toBeInTheDocument()

    rerender(<CommentList comments={[comment(1)]} total={60} query="" page={2} />)
    expect(screen.getByRole('link', { name: '← Más nuevos' })).toHaveAttribute('href', '/admin/comentarios/')

    rerender(<CommentList comments={[comment(1)]} total={60} query="" page={1} />)
    expect(screen.queryByRole('link', { name: '← Más nuevos' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Más antiguos →' })).toHaveAttribute('href', '/admin/comentarios/?pagina=2')
  })

  it('should delete a comment after confirming, and cancel without deleting', async () => {
    const user = userEvent.setup()
    mockedAxios.delete.mockResolvedValueOnce({})
    renderWithProviders(<CommentList comments={[comment(1)]} total={1} query="" page={1} />)

    await user.click(screen.getByRole('button', { name: 'Borrar el comentario de Eduardo' }))
    expect(await screen.findByRole('alertdialog')).toHaveTextContent('¿Borrar el comentario de Eduardo?')
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument())
    expect(mockedAxios.delete).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Borrar el comentario de Eduardo' }))
    await user.click(await screen.findByRole('button', { name: 'Sí, borrar' }))

    expect(await screen.findByText('Se ha borrado el comentario de Eduardo.')).toBeInTheDocument()
    expect(mockedAxios.delete).toHaveBeenCalledWith('/api/admin/comments/1/')
    expect(navigation.router.refresh).toHaveBeenCalled()
  })

  it('should explain why a delete failed', async () => {
    const user = userEvent.setup()
    mockedAxios.delete.mockRejectedValueOnce(new Error('network'))
    renderWithProviders(<CommentList comments={[comment(1)]} total={1} query="" page={1} />)

    await user.click(screen.getByRole('button', { name: 'Borrar el comentario de Eduardo' }))
    await user.click(await screen.findByRole('button', { name: 'Sí, borrar' }))

    expect(await screen.findByText(/No se ha podido borrar/)).toBeInTheDocument()
    expect(navigation.router.refresh).not.toHaveBeenCalled()
  })
})
