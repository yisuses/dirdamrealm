import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { postMock } from '@blog/api/post'
import { renderWithProviders } from '@blog/test/render'

import { CategoryLatestPosts } from './CategoryLatestPosts'

describe('CategoryLatestPosts', () => {
  it('should render the title and a card per post', () => {
    const posts = [postMock, { ...postMock, id: 3, title: 'Otro post' }]
    const { container } = renderWithProviders(<CategoryLatestPosts title="Otras entradas" posts={posts} />)

    expect(screen.getByRole('heading', { name: 'Otras entradas' })).toBeInTheDocument()
    expect(screen.getByText('Test Post')).toBeInTheDocument()
    expect(screen.getByText('Otro post')).toBeInTheDocument()
    expect(container.firstChild).toMatchSnapshot()
  })
})
