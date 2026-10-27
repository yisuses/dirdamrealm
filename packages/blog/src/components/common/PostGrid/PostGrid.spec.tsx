import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { postMock } from '@blog/api/post'
import { renderWithProviders } from '@blog/test/render'

import { PostGrid } from './PostGrid'

// Real translations, except a category with an empty label, to reach the Strapi-name fallback.
vi.mock('react-i18next', async importOriginal => {
  const actual = await importOriginal<typeof import('react-i18next')>()
  return {
    ...actual,
    useTranslation: (...args: Parameters<typeof actual.useTranslation>) => {
      const result = actual.useTranslation(...args)
      const translate = result.t as unknown as (key: string, options?: object) => string
      const t = ((key: string, options?: object) =>
        key === 'categories.UNTRANSLATED' ? '' : translate(key, options)) as unknown as typeof result.t
      return Object.assign([t, result.i18n, result.ready], { ...result, t })
    },
  }
})

const esPost: Post = {
  ...postMock,
  id: 2,
  title: 'Entrada en español',
  summary: 'Resumen en español',
  locale: 'es',
  categories: [
    { ...postMock.categories![0], code: 'ENG', localizedName: 'Engineering' },
    { ...postMock.categories![0], code: 'UNTRANSLATED', localizedName: 'Sin traducir' },
  ],
}
const enPost: Post = { ...postMock, coverImage: null, categories: null }

describe('PostGrid', () => {
  it('should render a card per post', () => {
    const { container } = renderWithProviders(<PostGrid posts={[esPost, enPost]} />)

    expect(screen.getByRole('link', { name: 'Entrada en español' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: postMock.title })).toBeInTheDocument()
    expect(screen.getByLabelText('Ingeniería')).toBeInTheDocument()
    expect(screen.getByLabelText('Sin traducir')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Entrada en español image' })).toHaveAttribute(
      'src',
      '/media/small_test.jpg',
    )
    expect(screen.getByRole('img', { name: `${postMock.title} image` })).toHaveAttribute('src', postMock.imgUrl)
    expect(screen.getAllByLabelText('Inglés')).toHaveLength(1)
    expect(container.firstChild).toMatchSnapshot()
  })

  it('should render at most `limit` posts', () => {
    renderWithProviders(<PostGrid posts={[esPost, enPost]} limit={1} />)

    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(screen.getByRole('img', { name: 'Entrada en español image' })).toBeInTheDocument()
  })

  it('should frame each card image as its cover asks', () => {
    const framed = {
      ...esPost,
      coverImage: { ...postMock.coverImage!, focus: { x: 10, y: 20 }, fit: 'contain' as const },
    }
    renderWithProviders(<PostGrid posts={[framed]} />)

    expect(screen.getByRole('img', { name: 'Entrada en español image' })).toHaveStyle({
      objectFit: 'contain',
      objectPosition: '10% 20%',
    })
  })
})
