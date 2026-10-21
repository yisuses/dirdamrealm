import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { postMock } from '@blog/api/post'
import { createTestQueryClient, renderWithProviders } from '@blog/test/render'
import { getCategoriesKey, getLatestPostsKey } from '@blog/utils/constants'

import { HomePage } from './HomePage'

describe('HomePage', () => {
  it('should tell there are no articles when nothing is published', () => {
    const { container } = renderWithProviders(<HomePage />)

    expect(screen.getByText('No hay artículos publicados.')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Últimas entradas' })).not.toBeInTheDocument()
    expect(container.firstChild).toMatchSnapshot()
  })

  it('should render the header post and the latest posts with the categories', () => {
    const queryClient = createTestQueryClient()
    queryClient.setQueryData(getLatestPostsKey('HomePage'), [postMock, { ...postMock, id: 3, title: 'Otro post' }])
    queryClient.setQueryData(getCategoriesKey('es'), postMock.categories)
    const { container } = renderWithProviders(<HomePage />, { queryClient })

    expect(screen.getByRole('heading', { name: 'Últimas entradas' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Todas' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Test Category' })).toBeInTheDocument()
    expect(screen.getByText('Otro post')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })
})
