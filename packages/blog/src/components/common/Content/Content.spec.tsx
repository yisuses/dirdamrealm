import { screen } from '@testing-library/react'
import type { DataProp } from 'editorjs-blocks-react-renderer'
import { describe, expect, it } from 'vitest'

import { renderWithProviders } from '@blog/test/render'

import { Content } from './Content'

const content: DataProp = {
  time: 123456789,
  version: '2.0.0',
  blocks: [
    { id: '1', type: 'header', data: { text: 'A heading', level: 2 } },
    { id: '2', type: 'paragraph', data: { text: 'A paragraph' } },
    { id: '3', type: 'list', data: { style: 'unordered', items: ['First item'] } },
    { id: '4', type: 'quote', data: { text: 'A quote', caption: 'Someone' } },
    {
      id: '5',
      type: 'image',
      data: { caption: 'An image', file: { url: '/media/test.jpg', width: 100, height: 50 } },
    },
    { id: '6', type: 'LinkTool', data: { link: 'https://example.com/', meta: { title: 'A link' } } },
  ],
}

describe('Content', () => {
  it('should render every block with its own renderer', () => {
    const { container } = renderWithProviders(<Content content={content} />)

    expect(screen.getByRole('heading', { name: 'A heading' })).toBeInTheDocument()
    expect(screen.getByText('A paragraph')).toBeInTheDocument()
    expect(screen.getByRole('listitem')).toHaveTextContent('First item')
    expect(screen.getByText('A quote').tagName).toBe('BLOCKQUOTE')
    expect(screen.getByRole('img', { name: 'An image' })).toHaveAttribute('src', '/media/test.jpg')
    expect(screen.getByRole('link', { name: 'A link' })).toHaveAttribute('href', 'https://example.com/')
    expect(container).toMatchSnapshot()
  })
})
