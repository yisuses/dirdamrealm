import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { addCommentValidate, getComments } from '@blog/api/comment'
import { navigation } from '@blog/test/navigation'
import { createTestQueryClient, renderWithProviders } from '@blog/test/render'
import { getPostCommentsKey } from '@blog/utils/constants'

import { PostComments } from './PostComments'

const captcha = vi.hoisted(() => ({ value: 'captcha-token' as string | null, reset: vi.fn() }))

vi.mock('@blog/api/comment', () => ({ addCommentValidate: vi.fn(), getComments: vi.fn() }))
// The real widget loads Google's script; this stub hands the test the token it would produce.
vi.mock('react-google-recaptcha', async () => {
  const { forwardRef, useImperativeHandle } = await import('react')
  return {
    default: forwardRef<unknown, { onChange: (value: string | null) => void; hl: string }>(function ReCAPTCHA(
      { onChange, hl },
      ref,
    ) {
      useImperativeHandle(ref, () => ({ getValue: () => captcha.value, reset: captcha.reset }))
      return (
        <button type="button" onClick={() => onChange(captcha.value)}>
          Solve captcha ({hl})
        </button>
      )
    }),
  }
})

const comments = [
  { id: 1, author: 'Ana', text: 'Great post!', createdAt: '2024-05-30T00:00:00.000Z' },
  { id: 2, author: 'Luis', text: 'Thanks for sharing', createdAt: '2024-04-01T00:00:00.000Z' },
] as unknown as Commentary[]

const postIds = [2, 1]

function renderComments(
  props: { comments?: Commentary[]; queryClient?: ReturnType<typeof createTestQueryClient> } = {},
) {
  navigation.params = { lng: 'en' }
  return renderWithProviders(<PostComments postId={1} comments={props.comments ?? comments} postIds={postIds} />, {
    lng: 'en',
    queryClient: props.queryClient,
  })
}

async function fillForm(user: ReturnType<typeof userEvent.setup>, author = 'Saúl', text = 'Nice article') {
  await user.type(screen.getByRole('textbox', { name: 'Your name' }), author)
  await user.type(screen.getByRole('textbox', { name: 'Comment' }), text)
}

describe('PostComments', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2024-06-01T00:00:00.000Z'))
    captcha.value = 'captcha-token'
    captcha.reset.mockReset()
    vi.mocked(addCommentValidate).mockReset().mockResolvedValue({ status: 'OK' })
    vi.mocked(getComments).mockReset()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should list the comments with their relative date and an empty form', () => {
    const { container } = renderComments()

    expect(screen.getByRole('heading', { name: 'Comments' })).toBeInTheDocument()
    expect(screen.getByText('Ana')).toBeInTheDocument()
    expect(screen.getByText('Great post!')).toBeInTheDocument()
    expect(screen.getByText('2 days ago')).toBeInTheDocument()
    expect(screen.getByText('2 months ago')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Solve captcha (en)' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Your name' })).toHaveAttribute('aria-invalid', 'false')
    expect(container.firstChild).toMatchSnapshot()
  })

  it('should tell there are no comments yet', () => {
    renderComments({ comments: [] })

    expect(screen.getByText('There are no comments.')).toBeInTheDocument()
  })

  it('should fall back to the given comments when the cached ones are empty', () => {
    const queryClient = createTestQueryClient()
    queryClient.setQueryData(getPostCommentsKey(postIds), null)
    renderComments({ queryClient })

    expect(screen.getByText('Great post!')).toBeInTheDocument()
  })

  it('should flag every required field when submitting an empty form', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    renderComments()

    await user.click(screen.getByRole('button', { name: 'Add comment' }))

    expect(await screen.findAllByText('Required field.')).toHaveLength(3)
    expect(screen.getByRole('textbox', { name: 'Your name' })).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('textbox', { name: 'Comment' })).toHaveAttribute('aria-invalid', 'true')
    expect(addCommentValidate).not.toHaveBeenCalled()
  })

  it('should validate the length of the name and the comment', async () => {
    const user = userEvent.setup()
    renderComments()

    await fillForm(user, 'Ana', 'Hi')
    await user.click(screen.getByRole('button', { name: 'Add comment' }))

    expect(await screen.findAllByText('Minimum length should be 4 characters.')).toHaveLength(2)

    await user.type(screen.getByRole('textbox', { name: 'Your name' }), 'x'.repeat(40))
    await user.click(screen.getByRole('button', { name: 'Add comment' }))

    expect(await screen.findByText('Maximun length should be 40 characters.')).toBeInTheDocument()
  })

  it('should not send the comment when the captcha has no token', async () => {
    const user = userEvent.setup()
    renderComments()
    await fillForm(user)
    await user.click(screen.getByRole('button', { name: 'Solve captcha (en)' }))
    captcha.value = null

    await user.click(screen.getByRole('button', { name: 'Add comment' }))

    await waitFor(() => expect(screen.queryByText('Required field.')).not.toBeInTheDocument())
    expect(addCommentValidate).not.toHaveBeenCalled()
  })

  it('should send the comment, then refresh the list and reset the form', async () => {
    const user = userEvent.setup()
    let resolveComment: (value: { status: string }) => void = () => {}
    vi.mocked(addCommentValidate).mockReturnValue(new Promise(resolve => (resolveComment = resolve)))
    vi.mocked(getComments).mockResolvedValue([
      { id: 3, author: 'Saúl', text: 'Nice article', createdAt: '2024-06-01T00:00:00.000Z' } as unknown as Commentary,
      ...comments,
    ])
    renderComments()
    await fillForm(user)
    await user.click(screen.getByRole('button', { name: 'Solve captcha (en)' }))

    await user.click(screen.getByRole('button', { name: 'Add comment' }))

    expect(addCommentValidate).toHaveBeenCalledWith({
      postId: 1,
      author: 'Saúl',
      text: 'Nice article',
      captcha: 'captcha-token',
    })
    expect(await screen.findByRole('button', { name: 'Adding' })).toBeDisabled()

    resolveComment({ status: 'OK' })

    expect(await screen.findByText('Nice article')).toBeInTheDocument()
    expect(getComments).toHaveBeenCalledWith({ ids: postIds })
    expect(captcha.reset).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('textbox', { name: 'Your name' })).toHaveValue('')
    expect(screen.getByRole('textbox', { name: 'Comment' })).toHaveValue('')
  })
})
