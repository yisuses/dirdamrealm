import { screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { postMock } from '@blog/api/post'
import { navigation } from '@blog/test/navigation'
import { createTestQueryClient, renderWithProviders } from '@blog/test/render'
import { QUERY_ABOUT, getCategoriesKey } from '@blog/utils/constants'

import { MainLayout } from './MainLayout'

const mainCategory = postMock.categories![0]!
const categories: Category[] = [
  mainCategory,
  { ...mainCategory, id: 2, code: 'hidden', name: 'Hidden', localizedName: 'Oculta', main: false },
]

const about: About = {
  id: 1,
  display: true,
  name: 'White Emotion',
  email: 'hello@example.com',
  createdAt: '2022-04-01T00:00:00.000Z',
  updatedAt: '2022-04-01T00:00:00.000Z',
  locale: 'en',
}

function renderLayout({ withAbout }: { withAbout: boolean }) {
  navigation.params = { lng: 'en' }
  navigation.pathname = '/en/'
  const queryClient = createTestQueryClient()
  queryClient.setQueryData(getCategoriesKey('en'), categories)
  if (withAbout) queryClient.setQueryData(QUERY_ABOUT, about)
  return renderWithProviders(
    <MainLayout>
      <p>Page content</p>
    </MainLayout>,
    { lng: 'en', queryClient },
  )
}

describe('MainLayout', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2024-06-01T00:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should render the header, the page inside main and the footer with the main categories', () => {
    const { container } = renderLayout({ withAbout: true })

    expect(within(screen.getByRole('main')).getByText('Page content')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Send an e-mail' })).toHaveAttribute('href', 'mailto:hello@example.com')
    expect(screen.getByRole('link', { name: 'Test Category' })).toHaveAttribute(
      'href',
      '/en/category/test-category/test-category/',
    )
    expect(screen.queryByText('Oculta')).not.toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  it('should leave the footer out until the about data is loaded', () => {
    renderLayout({ withAbout: false })

    expect(screen.getByRole('main')).toHaveTextContent('Page content')
    expect(screen.queryByRole('link', { name: 'Send an e-mail' })).not.toBeInTheDocument()
  })
})
