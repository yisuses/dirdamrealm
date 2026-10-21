import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderWithProviders } from '@blog/test/render'

import { ContentList, type ContentListBlockData } from './ContentList'

describe('ContentList', () => {
  it('should render a legacy unordered list of html strings', () => {
    const { container } = renderWithProviders(
      <ContentList data={{ style: 'unordered', items: ['<b>First</b>', 'Second'] }} />,
    )

    expect(screen.getByRole('list').tagName).toBe('UL')
    expect(screen.getAllByRole('listitem').map(item => item.textContent)).toEqual(['First', 'Second'])
    expect(screen.getByText('First').tagName).toBe('B')
    expect(container.firstChild).toMatchSnapshot()
  })

  it('should render a nested ordered list', () => {
    const items = [
      { content: 'Parent', items: [{ content: 'Child', items: [] }, 'Legacy child'] },
      {},
      null,
    ] as unknown as ContentListBlockData['items']
    const { container } = renderWithProviders(<ContentList data={{ style: 'ordered', items }} />)

    const [root, nested] = screen.getAllByRole('list')
    expect(root.tagName).toBe('OL')
    expect(nested.tagName).toBe('OL')
    expect(
      within(nested)
        .getAllByRole('listitem')
        .map(item => item.textContent),
    ).toEqual(['Child', 'Legacy child'])
    expect(screen.getAllByRole('listitem')).toHaveLength(5)
    expect(container.firstChild).toMatchSnapshot()
  })

  it('should render a nested unordered list', () => {
    renderWithProviders(<ContentList data={{ style: 'unordered', items: [{ content: 'Parent', items: ['Child'] }] }} />)

    expect(screen.getAllByRole('list').map(list => list.tagName)).toEqual(['UL', 'UL'])
  })

  it('should render an empty list without items', () => {
    renderWithProviders(<ContentList data={{ style: 'unordered' } as ContentListBlockData} />)

    expect(screen.getByRole('list')).toBeEmptyDOMElement()
  })
})
