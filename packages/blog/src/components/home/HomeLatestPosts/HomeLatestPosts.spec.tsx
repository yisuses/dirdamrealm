import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getLatestPosts } from '@blog/api'
import { postMock } from '@blog/api/post'
import { renderWithProviders } from '@blog/test/render'

import { HomeLatestPosts } from './HomeLatestPosts'

vi.mock('@blog/api', async importOriginal => ({
  ...(await importOriginal<typeof import('@blog/api')>()),
  getLatestPosts: vi.fn(),
}))

const headerPost = postMock
const posts = [headerPost, { ...postMock, id: 3, title: 'Otro post' }]
const categories: Category[] = [
  postMock.categories![0]!,
  { ...postMock.categories![0]!, id: 2, code: 'music', localizedName: 'Música' },
]

describe('HomeLatestPosts', () => {
  beforeEach(() => {
    vi.mocked(getLatestPosts).mockReset()
  })

  it('should render the posts after the header one without category filters', () => {
    const { container } = renderWithProviders(<HomeLatestPosts title="Últimas entradas" posts={posts} />)

    expect(screen.getByRole('heading', { name: 'Últimas entradas' })).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(screen.getByText('Otro post')).toBeInTheDocument()
    expect(screen.queryByText('Test Post')).not.toBeInTheDocument()
    expect(getLatestPosts).not.toHaveBeenCalled()
    expect(container.firstChild).toMatchSnapshot()
  })

  it('should fetch the posts of a category clicked and drop the header post', async () => {
    const user = userEvent.setup()
    vi.mocked(getLatestPosts).mockResolvedValue([headerPost, { ...postMock, id: 4, title: 'Post de música' }])
    const { container } = renderWithProviders(
      <HomeLatestPosts title="Últimas entradas" posts={posts} categories={categories} />,
    )
    expect(container.firstChild).toMatchSnapshot()

    await user.click(screen.getByRole('button', { name: 'Música' }))

    expect(await screen.findByText('Post de música')).toBeInTheDocument()
    expect(screen.queryByText('Otro post')).not.toBeInTheDocument()
    expect(screen.queryByText('Test Post')).not.toBeInTheDocument()
    expect(getLatestPosts).toHaveBeenCalledWith({ category: 'music', locale: 'es', limit: 16 })
  })

  it('should select a category with the Enter or Space keys only', async () => {
    const user = userEvent.setup()
    vi.mocked(getLatestPosts).mockResolvedValue([])
    renderWithProviders(<HomeLatestPosts title="Últimas entradas" posts={posts} categories={categories} />)

    screen.getByRole('button', { name: 'Música' }).focus()
    await user.keyboard('a')
    expect(getLatestPosts).not.toHaveBeenCalled()

    await user.keyboard('{Enter}')
    await waitFor(() => expect(getLatestPosts).toHaveBeenCalledWith(expect.objectContaining({ category: 'music' })))

    screen.getByRole('button', { name: 'Test Category' }).focus()
    await user.keyboard(' ')
    await waitFor(() =>
      expect(getLatestPosts).toHaveBeenCalledWith(expect.objectContaining({ category: 'test-category' })),
    )
    await waitFor(() => expect(screen.queryByText('Otro post')).not.toBeInTheDocument())
  })
})
