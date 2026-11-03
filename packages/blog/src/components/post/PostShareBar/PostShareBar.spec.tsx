import { fireEvent, screen } from '@testing-library/react'
import { useRef } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { renderWithProviders } from '@blog/test/render'

import { PostShareBar } from './PostShareBar'

const box = (rect: Partial<DOMRect>) => () => ({ top: 0, bottom: 0, height: 0, ...rect }) as DOMRect

function Page() {
  const byline = useRef<HTMLDivElement>(null)
  const article = useRef<HTMLDivElement>(null)
  return (
    <>
      <PostShareBar title="Mi entrada" trigger={byline} article={article}>
        <a href="https://x.com/share">Share on X</a>
      </PostShareBar>
      <div ref={article} data-testid="article">
        <div ref={byline} data-testid="byline" />
      </div>
    </>
  )
}

describe('PostShareBar', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should stay hidden while the byline is in view', () => {
    // jsdom lays nothing out: put the byline (and everything else) below the menu bar.
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(box({ bottom: 500 }))
    const { container } = renderWithProviders(<Page />)

    expect(screen.getByTestId('post-share-bar')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByText('Mi entrada')).toBeInTheDocument()
    expect(container.firstChild).toMatchSnapshot()
  })

  it('should show the title and share buttons, and the reading progress, once the byline scrolls away', () => {
    renderWithProviders(<Page />)
    vi.spyOn(screen.getByTestId('byline'), 'getBoundingClientRect').mockImplementation(box({ bottom: 10 }))
    vi.spyOn(screen.getByTestId('article'), 'getBoundingClientRect').mockImplementation(
      box({ top: -1000, height: 2768 }),
    )

    fireEvent.scroll(window)

    expect(screen.getByTestId('post-share-bar')).toHaveAttribute('aria-hidden', 'false')
    expect(screen.getByRole('link', { name: 'Share on X' })).toBeInTheDocument()
    // jsdom's window is 768px tall: 1000 of the 2000 scrollable pixels read.
    expect(screen.getByRole('progressbar', { name: 'Cuánto llevas leído' })).toHaveAttribute('aria-valuenow', '50')
  })

  it('should count a text shorter than the window as read, and never go past either end', () => {
    renderWithProviders(<Page />)
    const article = vi.spyOn(screen.getByTestId('article'), 'getBoundingClientRect')

    article.mockImplementation(box({ top: 0, height: 300 }))
    fireEvent.scroll(window)
    expect(screen.getByRole('progressbar', { hidden: true })).toHaveAttribute('aria-valuenow', '100')

    article.mockImplementation(box({ top: 200, height: 2768 }))
    fireEvent.scroll(window)
    expect(screen.getByRole('progressbar', { hidden: true })).toHaveAttribute('aria-valuenow', '0')

    article.mockImplementation(box({ top: -5000, height: 2768 }))
    fireEvent.scroll(window)
    expect(screen.getByRole('progressbar', { hidden: true })).toHaveAttribute('aria-valuenow', '100')
  })

  it('should stop listening once gone', () => {
    const remove = vi.spyOn(window, 'removeEventListener')
    const { unmount } = renderWithProviders(<Page />)

    unmount()

    expect(remove).toHaveBeenCalledWith('scroll', expect.any(Function))
  })
})
