import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { PostPage } from '@blog/components'
import { PreviewBanner } from '@blog/components/post/PreviewBanner/PreviewBanner'
import { getPreviewPostFromDb } from '@blog/db/queries/posts'
import { renderWithProviders } from '@blog/test/render'
import { getPostKey } from '@blog/utils/constants'

import PreviewPage, { dynamic, metadata } from './page'

vi.mock('@blog/db/queries/posts', () => ({ getPreviewPostFromDb: vi.fn() }))

const token = '993667bb-0d43-4b43-a55f-2eb20c4f8e1d'
const params = (postId: string, value = token) => ({
  params: Promise.resolve({ lng: 'es' as const, postId, token: value }),
})
const notFound = expect.objectContaining({ digest: expect.stringContaining('NEXT_HTTP_ERROR_FALLBACK;404') })

describe('preview page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should never be cached or indexed', () => {
    expect(dynamic).toBe('force-dynamic')
    expect(metadata.robots).toEqual({ index: false, follow: false })
  })

  it('should render the post page with the preview, under a banner', async () => {
    const post = { id: 344, title: 'Borrador' } as Post
    vi.mocked(getPreviewPostFromDb).mockResolvedValueOnce(post)

    const page = await PreviewPage(params('344'))

    expect(getPreviewPostFromDb).toHaveBeenCalledWith({ id: 344, token })
    const [banner, hydration] = page.props.children
    expect(banner.type).toBe(PreviewBanner)
    expect(hydration.props.children.type).toBe(PostPage)
    expect(hydration.props.state.queries).toEqual([
      expect.objectContaining({ queryKey: getPostKey(344), state: expect.objectContaining({ data: post }) }),
    ])
  })

  it('should 404 for malformed links and unknown previews', async () => {
    await expect(PreviewPage(params('abc'))).rejects.toMatchObject(notFound)
    await expect(PreviewPage(params('344', 'not-a-token'))).rejects.toMatchObject(notFound)
    expect(getPreviewPostFromDb).not.toHaveBeenCalled()

    vi.mocked(getPreviewPostFromDb).mockResolvedValueOnce(undefined)
    await expect(PreviewPage(params('344'))).rejects.toMatchObject(notFound)
  })

  it('should tell the reader it is a preview', () => {
    renderWithProviders(<PreviewBanner />)

    expect(screen.getByRole('note')).toHaveTextContent('Vista previa. Así se verá la entrada al publicarla.')
  })
})
