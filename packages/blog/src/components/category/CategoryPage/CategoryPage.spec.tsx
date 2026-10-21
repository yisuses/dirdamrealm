import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { postMock } from '@blog/api/post'
import { navigation } from '@blog/test/navigation'
import { createTestQueryClient, renderWithProviders } from '@blog/test/render'
import { getCategoryCodeKey, getLatestPostsKey } from '@blog/utils/constants'

import { CategoryPage } from './CategoryPage'

const category = postMock.categories![0]!

function renderCategoryPage({ posts, categories }: { posts?: Post[]; categories?: Category[] }) {
  navigation.params = { lng: 'es', categoryCode: category.code }
  const queryClient = createTestQueryClient()
  if (posts) queryClient.setQueryData(getLatestPostsKey(category.code), posts)
  if (categories) queryClient.setQueryData(getCategoryCodeKey(category.code), categories)
  return renderWithProviders(<CategoryPage />, { queryClient })
}

describe('CategoryPage', () => {
  it('should render nothing while the category is not loaded', () => {
    const { container } = renderCategoryPage({ posts: [postMock] })

    expect(container).toBeEmptyDOMElement()
  })

  it('should render the latest post as header and the rest in the grid', () => {
    const posts = [postMock, { ...postMock, id: 3, title: 'Otro post' }]
    const { container } = renderCategoryPage({ posts, categories: [category] })

    expect(screen.getByRole('heading', { name: 'Otras entradas de Test Category' })).toBeInTheDocument()
    expect(screen.getByText('Otro post')).toBeInTheDocument()
    expect(screen.queryByText('No se han publicado artículos para esta categoría')).not.toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  it('should tell there are no articles when the category has no posts', () => {
    const { container } = renderCategoryPage({ categories: [category] })

    expect(screen.getByText('No se han publicado artículos para esta categoría')).toBeInTheDocument()
    expect(container.firstChild).toMatchSnapshot()
  })
})
