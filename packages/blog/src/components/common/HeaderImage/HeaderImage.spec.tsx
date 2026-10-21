import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { postMock } from '@blog/api/post/post.mock'
import { navigation } from '@blog/test/navigation'
import { renderWithProviders } from '@blog/test/render'

import { HeaderImage } from './HeaderImage'

const category = postMock.categories![0]

const post: Post = {
  ...postMock,
  locale: 'es',
  title: 'Mi entrada',
  summary: 'Resumen de la entrada',
  categories: [
    { ...category, code: 'cinema', name: 'Cinema', translations: { es: 'Cine', en: 'Cinema' } },
    { ...category, code: 'music', name: 'Music' },
    { ...category, code: 'documentaries', name: 'Documentaries' },
    { ...category, code: 'art', name: 'Art' },
  ],
  coverImageAuthor: 'Jane Doe',
  coverImageSourceUrl: 'https://unsplash.com/jane',
}

describe('HeaderImage', () => {
  it('should render the cover image with the post info and the image credit', () => {
    const { container } = renderWithProviders(<HeaderImage post={post} showPostInfo />)

    expect(screen.getByRole('img', { name: 'Imagen de la entrada "Mi entrada"' })).toHaveAttribute(
      'src',
      '/media/large_test.jpg',
    )
    expect(screen.getByRole('link', { name: 'Mi entrada' })).toHaveAttribute('href', '/post/1/mi-entrada/')
    expect(screen.getByText('01.04.2022')).toBeInTheDocument()
    expect(screen.getByText('Resumen de la entrada')).toBeInTheDocument()
    // Only the first three categories, shortest first, translated when possible.
    expect(screen.getByLabelText('Music')).toBeInTheDocument()
    expect(screen.getByLabelText('Cine')).toBeInTheDocument()
    expect(screen.getByLabelText('Documentaries')).toBeInTheDocument()
    expect(screen.queryByLabelText('Art')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Jane Doe' })).toHaveAttribute('href', 'https://unsplash.com/jane')
    expect(container.firstChild).toMatchSnapshot()
  })

  it('should tag a post in another language and localize its link', () => {
    navigation.params = { lng: 'en' }
    renderWithProviders(<HeaderImage post={{ ...post, categories: undefined } as unknown as Post} showPostInfo />, {
      lng: 'en',
    })

    expect(screen.getByLabelText('Spanish')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Mi entrada' })).toHaveAttribute('href', '/en/post/1/mi-entrada/')
  })

  it('should render only the image without post info or credit', () => {
    const { container } = renderWithProviders(
      <HeaderImage post={{ ...post, coverImage: null, coverImageAuthor: null }} />,
    )

    expect(screen.getByRole('img')).toHaveAttribute('src', postMock.imgUrl)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(container.firstChild).toMatchSnapshot()
  })
})
