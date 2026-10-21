import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { navigation } from '@blog/test/navigation'
import { renderWithProviders } from '@blog/test/render'

import { PostCard, type PostCardProps } from './PostCard'

const props: PostCardProps = {
  id: 7,
  categories: [
    { key: 'HIS', label: 'Historia y pensamiento' },
    { key: 'ENG', label: 'Ingeniería' },
  ],
  date: '2022-04-01T00:00:00.000Z',
  title: 'Mi entrada',
  description: 'Resumen de la entrada',
  imageUrl: '/media/small_test.jpg',
  locale: 'Inglés',
  isSameLocale: true,
}

describe('PostCard', () => {
  it('should render the post with links, image and categories sorted by length', () => {
    const { container } = renderWithProviders(<PostCard {...props} categories={[...props.categories]} />)

    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(2)
    links.forEach(link => expect(link).toHaveAttribute('href', '/post/7/mi-entrada/'))
    expect(screen.getByRole('img', { name: 'Mi entrada image' })).toHaveAttribute('src', '/media/small_test.jpg')
    expect(screen.getByText('Resumen de la entrada')).toBeInTheDocument()
    expect(screen.queryByLabelText('Inglés')).not.toBeInTheDocument()

    const tags = container.querySelectorAll('[aria-label="Ingeniería"], [aria-label="Historia y pensamiento"]')
    expect(Array.from(tags).map(tag => tag.textContent)).toEqual(['Ingeniería', 'Historia y pensamiento'])
    expect(container.firstChild).toMatchSnapshot()
  })

  it('should add a language tag and a localized link when the post is in another locale', () => {
    navigation.params = { lng: 'en' }

    renderWithProviders(<PostCard {...props} categories={[]} isSameLocale={false} />)

    expect(screen.getByLabelText('Inglés')).toHaveTextContent('Inglés')
    expect(within(screen.getAllByRole('link')[0]).getByRole('img')).toBeInTheDocument()
    expect(screen.getAllByRole('link')[0]).toHaveAttribute('href', '/en/post/7/mi-entrada/')
  })
})
