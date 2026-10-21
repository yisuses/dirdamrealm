import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { getAlgoliaPosts, postMock } from '@blog/api/post'
import { renderWithProviders } from '@blog/test/render'

import { SearchPosts } from './SearchPosts'

vi.mock('@blog/api/post', async importOriginal => ({
  ...(await importOriginal<typeof import('@blog/api/post')>()),
  getAlgoliaPosts: vi.fn(),
}))

const publishedPost: Post = { ...postMock, id: 3, title: 'Entrada publicada', summary: 'Publicada' }
const draftPost: Post = { ...postMock, id: 4, title: 'Borrador', publishedAt: null as unknown as string }

describe('SearchPosts', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should render the search input without results', () => {
    const { container } = renderWithProviders(<SearchPosts inputTitle="Buscar" inputPlaceholder="Escribe algo" />)

    expect(screen.getByRole('textbox', { name: 'Buscar' })).toHaveAttribute('placeholder', 'Escribe algo')
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(getAlgoliaPosts).not.toHaveBeenCalled()
    expect(container.firstChild).toMatchSnapshot()
  })

  it('should search after the debounce and list only published posts', async () => {
    vi.mocked(getAlgoliaPosts).mockResolvedValue([publishedPost, draftPost])
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderWithProviders(<SearchPosts inputTitle="Buscar" inputPlaceholder="Escribe algo" />)

    await user.type(screen.getByRole('textbox', { name: 'Buscar' }), 'hola')
    expect(screen.getByRole('textbox', { name: 'Buscar' })).toHaveValue('hola')
    await act(() => vi.advanceTimersByTimeAsync(300))

    expect(await screen.findByText('Entrada publicada')).toBeInTheDocument()
    expect(screen.queryByText('Borrador')).not.toBeInTheDocument()
    expect(getAlgoliaPosts).toHaveBeenCalledTimes(1)
    expect(getAlgoliaPosts).toHaveBeenCalledWith({ query: 'hola' })
  })
})
