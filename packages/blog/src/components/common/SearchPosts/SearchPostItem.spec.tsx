import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { postMock } from '@blog/api/post'
import { navigation } from '@blog/test/navigation'
import { renderWithProviders } from '@blog/test/render'

import { SearchPostResultItem } from './SearchPostItem'

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

const post: Post = {
  ...postMock,
  id: 5,
  title: 'Mi entrada',
  summary: 'Resumen de la entrada',
  categories: [
    { ...postMock.categories![0], code: 'ENG', localizedName: 'Engineering' },
    { ...postMock.categories![0], code: 'UNTRANSLATED', localizedName: 'Sin traducir' },
  ],
}

describe('SearchPostResultItem', () => {
  it('should link to the post and show its thumbnail, summary and categories', () => {
    const { container } = renderWithProviders(<SearchPostResultItem post={post} />)

    expect(screen.getByRole('link')).toHaveAttribute('href', '/post/5/mi-entrada/')
    expect(screen.getByRole('img', { name: 'Imagen de la entrada "Mi entrada"' })).toHaveAttribute(
      'src',
      '/media/thumbnail_test.jpg',
    )
    expect(screen.getByText('Resumen de la entrada')).toBeInTheDocument()
    expect(screen.getByLabelText('Ingeniería')).toBeInTheDocument()
    expect(screen.getByLabelText('Sin traducir')).toBeInTheDocument()
    expect(container.firstChild).toMatchSnapshot()
  })

  it('should localize the link and render without categories', () => {
    navigation.params = { lng: 'en' }

    renderWithProviders(<SearchPostResultItem post={{ ...post, categories: null }} />, { lng: 'en' })

    expect(screen.getByRole('link')).toHaveAttribute('href', '/en/post/5/mi-entrada/')
    expect(screen.queryByLabelText('Engineering')).not.toBeInTheDocument()
  })
})
