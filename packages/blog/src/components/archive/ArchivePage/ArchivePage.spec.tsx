import { act, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { postMock } from '@blog/api/post'
import { getAllPosts, getCategories } from '@blog/api/public'
import { navigation } from '@blog/test/navigation'
import { createTestQueryClient, renderWithProviders } from '@blog/test/render'
import { ARCHIVE_POSTS_KEY, getCategoriesKey } from '@blog/utils/constants'

import { ArchivePage } from './ArchivePage'

vi.mock('@blog/api/public', () => ({ getCategories: vi.fn(), getAllPosts: vi.fn() }))

const buildPost = (id: number, title: string, publishedAt: string): Post => ({ ...postMock, id, title, publishedAt })

const marchPost = buildPost(10, 'March post', '2023-03-10T10:00:00.000Z')
const lateMarchPost = buildPost(11, 'Late March post', '2023-03-20T10:00:00.000Z')
const januaryPost = buildPost(12, 'January post', '2023-01-05T10:00:00.000Z')
const oldPost = buildPost(13, 'Old post', '2022-04-01T10:00:00.000Z')
const musicPost = buildPost(14, 'Music post', '2021-06-01T10:00:00.000Z')
const allPosts = [januaryPost, oldPost, marchPost, lateMarchPost]

const categories: Category[] = [
  postMock.categories![0]!,
  { ...postMock.categories![0]!, id: 2, code: 'music', localizedName: 'Music' },
]

function renderArchive({ seed = true, queryClient = createTestQueryClient() } = {}) {
  navigation.params = { lng: 'en' }
  if (seed) {
    queryClient.setQueryData(getCategoriesKey('en'), categories)
    queryClient.setQueryData(ARCHIVE_POSTS_KEY, allPosts)
  }
  return renderWithProviders(<ArchivePage />, { lng: 'en', queryClient })
}

describe('ArchivePage', () => {
  beforeEach(() => {
    vi.mocked(getCategories).mockReset().mockResolvedValue(categories)
    vi.mocked(getAllPosts).mockReset()
  })

  it('should show a spinner while the posts load', async () => {
    vi.mocked(getAllPosts).mockReturnValue(new Promise(() => {}))
    const { container } = renderArchive({ seed: false })

    expect(await screen.findByLabelText('Loading posts')).toBeInTheDocument()
    expect(getAllPosts).toHaveBeenCalledWith({ locale: 'en', category: undefined })
    expect(getCategories).toHaveBeenCalledWith({ locale: 'en' })
    expect(container.firstChild).toMatchSnapshot()
  })

  it('should tell there are no posts when the archive is empty', async () => {
    vi.mocked(getAllPosts).mockResolvedValue([])
    renderArchive({ seed: false })

    expect(await screen.findByText('No published posts yet.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Filter by year' })).toHaveTextContent('All years')
  })

  it('should group the posts by year and month, newest first', () => {
    const { container } = renderArchive()

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Archive')
    expect(screen.getAllByRole('heading', { level: 2 }).map(heading => heading.textContent)).toEqual(['2023', '2022'])
    expect(screen.getAllByRole('heading', { level: 3 }).map(heading => heading.textContent)).toEqual([
      'March',
      'January',
      'April',
    ])
    expect(screen.getAllByRole('link').map(link => link.textContent)).toEqual([
      'Late March post',
      'March post',
      'January post',
      'Old post',
    ])
    expect(screen.getByRole('link', { name: 'Old post' })).toHaveAttribute('href', '/en/post/13/old-post/')
    expect(getAllPosts).not.toHaveBeenCalled()
    expect(container.firstChild).toMatchSnapshot()
  })

  it('should refetch the whole archive without a category filter', async () => {
    vi.mocked(getAllPosts).mockResolvedValue([oldPost])
    const queryClient = createTestQueryClient()
    renderArchive({ queryClient })

    await act(() => queryClient.invalidateQueries({ queryKey: ARCHIVE_POSTS_KEY, exact: true }))

    expect(vi.mocked(getAllPosts).mock.calls[0]![0]).toStrictEqual({ locale: 'en', category: undefined })
    expect(await screen.findByRole('link', { name: 'Old post' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'March post' })).not.toBeInTheDocument()
  })

  it('should filter the loaded posts by year', async () => {
    const user = userEvent.setup()
    renderArchive()

    await user.click(screen.getByRole('button', { name: 'Filter by year' }))
    await user.click(await screen.findByRole('menuitem', { name: '2022' }))

    expect(screen.getByRole('button', { name: 'Filter by year' })).toHaveTextContent('2022')
    expect(screen.getAllByRole('heading', { level: 2 }).map(heading => heading.textContent)).toEqual(['2022'])
    expect(screen.getByRole('link', { name: 'Old post' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'March post' })).not.toBeInTheDocument()
  })

  it('should fetch the posts of the selected category, keeping the previous ones while loading', async () => {
    const user = userEvent.setup()
    let resolvePosts: (posts: Post[]) => void = () => {}
    vi.mocked(getAllPosts).mockReturnValue(new Promise(resolve => (resolvePosts = resolve)))
    renderArchive()

    await user.click(screen.getByRole('button', { name: 'Filter by category' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Music' }))

    expect(getAllPosts).toHaveBeenCalledWith({ locale: 'en', category: 'music' })
    expect(screen.getByRole('button', { name: 'Filter by category' })).toHaveTextContent('Music')
    // Previous results stay visible (dimmed) while the category loads.
    const results = () => screen.getAllByRole('heading', { level: 2 })[0]!.parentElement!.parentElement!
    expect(screen.getByRole('link', { name: 'Old post' })).toBeInTheDocument()
    expect(results()).toHaveStyle({ opacity: '0.5' })

    resolvePosts([musicPost])

    expect(await screen.findByRole('link', { name: 'Music post' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Old post' })).not.toBeInTheDocument()
    expect(results()).toHaveStyle({ opacity: '1' })
    const year = screen.getByRole('heading', { level: 2 }).parentElement!
    expect(within(year).getByRole('heading', { level: 3 })).toHaveTextContent('June')
    // The year selector keeps listing every year of the unfiltered archive.
    await user.click(screen.getByRole('button', { name: 'Filter by year' }))
    await waitFor(() => expect(screen.getByRole('menuitem', { name: '2023' })).toBeInTheDocument())
    expect(screen.queryByRole('menuitem', { name: '2021' })).not.toBeInTheDocument()
  })
})
