import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { postMock } from '@blog/api/post'
import { navigation } from '@blog/test/navigation'
import { createTestQueryClient, renderWithProviders } from '@blog/test/render'
import { getLatestPostsKey, getPostCommentsKey, getPostKey } from '@blog/utils/constants'

import { PostPage } from './PostPage'

vi.mock('@blog/api/comment', () => ({ addCommentValidate: vi.fn(), getComments: vi.fn() }))
vi.mock('react-google-recaptcha', () => ({ default: () => <div data-testid="recaptcha" /> }))

const comment = {
  id: 9,
  author: 'Ana',
  text: 'Great post!',
  createdAt: '2024-05-30T00:00:00.000Z',
} as unknown as Commentary
const relatedPost: Post = { ...postMock, id: 5, title: 'Related post' }

interface RenderOptions {
  post?: Post
  latestPosts?: Post[]
  pathname?: string | null
}

function renderPostPage({ post, latestPosts, pathname = '/en/post/1/test-post/' }: RenderOptions = {}) {
  navigation.params = { lng: 'en', postId: '1' }
  navigation.pathname = pathname as string
  const queryClient = createTestQueryClient()
  if (post) {
    queryClient.setQueryData(getPostKey(1), post)
    queryClient.setQueryData(getPostCommentsKey([2, 1]), [comment])
  }
  if (latestPosts) queryClient.setQueryData(getLatestPostsKey('test-category'), latestPosts)
  return renderWithProviders(<PostPage />, { lng: 'en', queryClient })
}

describe('PostPage', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2024-06-01T00:00:00.000Z'))
    vi.stubEnv('BASE_URL', 'https://whemotion.com')
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllEnvs()
    Reflect.deleteProperty(navigator, 'share')
  })

  it('should render nothing while the post is not loaded', () => {
    const { container } = renderPostPage()

    expect(container).toBeEmptyDOMElement()
  })

  it('should render the post with share links, tags, comments and posts of the same category', () => {
    const { container } = renderPostPage({ post: postMock, latestPosts: [postMock, relatedPost] })

    expect(screen.getByRole('heading', { level: 1, name: 'Test Post' })).toBeInTheDocument()
    expect(screen.getByText('Test Writer')).toBeInTheDocument()
    expect(screen.getByText(/^01\.04\.2022 · \d+ min reading time$/)).toBeInTheDocument()
    // Above the title and again next to the share buttons at the end.
    expect(screen.getAllByLabelText('Test Category')).toHaveLength(2)
    const encodedUrl = encodeURIComponent('https://whemotion.com/en/post/1/test-post/')
    expect(screen.getAllByRole('link', { name: 'Share on X' })[0]).toHaveAttribute(
      'href',
      `https://twitter.com/intent/tweet?text=${encodeURIComponent('Check this article at White Emotion: Test Post')}&url=${encodedUrl}`,
    )
    expect(screen.getAllByRole('link', { name: 'Share on Facebook' })[0]).toHaveAttribute(
      'href',
      `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    )
    // The buttons by the byline are hidden on phones (all jsdom has).
    expect(screen.getAllByRole('link', { name: 'Share on Linkedin', hidden: true })).toHaveLength(2)
    expect(screen.queryByText('Share on ...')).not.toBeInTheDocument()
    // Comments of every localization of the post are shown.
    expect(screen.getByText('Great post!')).toBeInTheDocument()
    const sameCategory = screen.getByRole('heading', { name: 'Also in this category' }).parentElement!
    expect(within(sameCategory).getByText('Related post')).toBeInTheDocument()
    expect(within(sameCategory).queryByText('Test Post')).not.toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  it('should offer the native share sheet when the browser supports it', async () => {
    const user = userEvent.setup()
    const share = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'share', { value: share, configurable: true })
    renderPostPage({ post: postMock })

    const [nativeShare] = await screen.findAllByText('Share on ...')
    await user.click(nativeShare!.closest('a')!)

    expect(share).toHaveBeenCalledWith({ url: 'https://whemotion.com/en/post/1/test-post/' })
  })

  it('should cope with a post without localizations, categories or writer', () => {
    const post: Post = { ...postMock, localizations: null, categories: undefined, writer: undefined } as unknown as Post
    const queryClient = createTestQueryClient()
    navigation.params = { lng: 'en', postId: '1' }
    navigation.pathname = null as unknown as string
    queryClient.setQueryData(getPostKey(1), post)
    queryClient.setQueryData(getLatestPostsKey(), [postMock])
    renderWithProviders(<PostPage />, { lng: 'en', queryClient })

    expect(screen.getByRole('heading', { level: 1, name: 'Test Post' })).toBeInTheDocument()
    expect(screen.queryByLabelText('Test Category')).not.toBeInTheDocument()
    expect(screen.getByText('There are no comments.')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Also in this category' })).not.toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'Share on Facebook' })[0]).toHaveAttribute(
      'href',
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://whemotion.com')}`,
    )
  })
})
