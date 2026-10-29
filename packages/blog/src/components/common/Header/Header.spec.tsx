import { act, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { getCategories } from '@blog/api/public'
import { navigation } from '@blog/test/navigation'
import { createTestQueryClient, renderWithProviders } from '@blog/test/render'

import { Header, type HeaderProps } from './Header'

const theme = vi.hoisted(() => ({ resolvedTheme: 'light', setTheme: vi.fn() }))

// next-themes needs its provider and a real document to resolve the theme; drive it directly.
vi.mock('next-themes', async importOriginal => ({
  ...(await importOriginal<typeof import('next-themes')>()),
  useTheme: () => theme,
}))

// The language switch prefetches the categories of the next locale.
vi.mock('@blog/api/public', () => ({ getCategories: vi.fn() }))

const categories: HeaderProps['categories'] = [
  { url: '/category/music/musica/', code: 'music', name: 'Música', localizedName: 'Música' },
  { url: '/category/cinema/cine/', code: 'cinema', name: 'Cine', localizedName: 'Cine' },
]

const navLink = (name: string) => within(screen.getByRole('navigation')).getByRole('link', { name })

describe('Header', () => {
  afterEach(() => {
    theme.resolvedTheme = 'light'
    theme.setTheme.mockReset()
    vi.mocked(getCategories).mockReset()
  })

  it('should render the masthead, the navigation and the actions', () => {
    const { container } = renderWithProviders(<Header categories={categories} />)

    expect(screen.getByRole('link', { name: 'Logotipo de White Emotion' })).toHaveAttribute('href', '/')
    expect(screen.getByText('Deporte, música, actualidad y viajes contados con emoción')).toBeInTheDocument()
    expect(
      within(screen.getByRole('navigation'))
        .getAllByRole('link')
        .map(link => [link.textContent, link.getAttribute('href')]),
    ).toEqual([
      ['Inicio', '/'],
      ['Música', '/category/music/musica/'],
      ['Cine', '/category/cinema/cine/'],
      ['Archivo', '/archive/'],
    ])
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Toggle theme' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cambiar idioma' })).toHaveTextContent('ES')
    expect(container.firstChild).toMatchSnapshot()
  })

  it('should mark the current category as the current page', () => {
    navigation.pathname = '/category/music/musica/'
    renderWithProviders(<Header categories={categories} />)

    expect(navLink('Música')).toHaveAttribute('aria-current', 'page')
    expect(navLink('Cine')).not.toHaveAttribute('aria-current')
    expect(navLink('Inicio')).not.toHaveAttribute('aria-current')
  })

  it('should mark the archive link on a localized archive page', () => {
    navigation.params = { lng: 'en' }
    navigation.pathname = '/en/archive/'
    renderWithProviders(<Header categories={categories} />, { lng: 'en' })

    expect(navLink('Archive')).toHaveAttribute('href', '/en/archive/')
    expect(navLink('Archive')).toHaveAttribute('aria-current', 'page')
    expect(navLink('Home')).toHaveAttribute('href', '/en/')
    expect(screen.getByRole('button', { name: 'Change language' })).toHaveTextContent('EN')
  })

  it.each([['/en'], [null]])('should treat %s as the home page', pathname => {
    navigation.pathname = pathname as string
    renderWithProviders(<Header categories={categories} />)

    expect(navLink('Inicio')).toHaveAttribute('aria-current', 'page')
    expect(navLink('Archivo')).not.toHaveAttribute('aria-current')
  })

  it('should show the small logo in the bar once the masthead scrolls away', () => {
    let report: IntersectionObserverCallback = () => {}
    const disconnect = vi.fn()
    vi.spyOn(window, 'IntersectionObserver').mockImplementation(function (callback) {
      report = callback
      return { observe: vi.fn(), disconnect } as unknown as IntersectionObserver
    })
    const { unmount } = renderWithProviders(<Header categories={categories} />)
    const smallLogo = within(screen.getByRole('navigation')).getAllByRole('link', { hidden: true })[0]!
    expect(smallLogo).toHaveAttribute('aria-hidden', 'true')

    act(() => report([{ isIntersecting: false } as IntersectionObserverEntry], {} as IntersectionObserver))

    expect(smallLogo).not.toHaveAttribute('aria-hidden', 'true')
    unmount()
    expect(disconnect).toHaveBeenCalled()
    vi.restoreAllMocks()
  })

  it('should open the search modal', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Header categories={categories} />)

    await user.click(screen.getByRole('button', { name: 'Search' }))

    expect(await screen.findByRole('dialog')).toHaveTextContent('¿Estás buscando algo en concreto? (título)')
    expect(screen.getByRole('textbox', { name: 'Buscar por entrada' })).toHaveAttribute(
      'placeholder',
      'Título de la entrada',
    )
  })

  it('should close the search modal', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Header categories={categories} />)
    await user.click(screen.getByRole('button', { name: 'Search' }))
    await screen.findByRole('dialog')

    await user.click(screen.getByRole('button', { name: 'Close' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('should switch to dark mode from light mode', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Header categories={categories} />)

    await user.click(screen.getByRole('button', { name: 'Toggle theme' }))

    expect(theme.setTheme).toHaveBeenCalledWith('dark')
  })

  it('should switch to light mode from dark mode', async () => {
    theme.resolvedTheme = 'dark'
    const user = userEvent.setup()
    const { container } = renderWithProviders(<Header categories={categories} />)

    await user.click(screen.getByRole('button', { name: 'Toggle theme' }))

    expect(theme.setTheme).toHaveBeenCalledWith('light')
    expect(screen.getByRole('button', { name: 'Toggle theme' })).toMatchSnapshot()
    expect(container.firstChild).not.toBeNull()
  })

  it('should prefetch the english categories and switch to english', async () => {
    vi.mocked(getCategories).mockResolvedValue([])
    navigation.pathname = '/archive/'
    const queryClient = createTestQueryClient()
    const user = userEvent.setup()
    renderWithProviders(<Header categories={categories} />, { queryClient })

    await user.click(screen.getByRole('button', { name: 'Cambiar idioma' }))

    await waitFor(() => expect(navigation.router.push).toHaveBeenCalledWith('/en/archive/'))
    expect(getCategories).toHaveBeenCalledWith({ locale: 'en' })
    expect(queryClient.getQueryData(['categories', 'en'])).toEqual([])
  })

  it('should switch to spanish from english', async () => {
    vi.mocked(getCategories).mockResolvedValue([])
    navigation.params = { lng: 'en' }
    navigation.pathname = '/en/archive/'
    const user = userEvent.setup()
    renderWithProviders(<Header categories={categories} />, { lng: 'en' })

    await user.click(screen.getByRole('button', { name: 'Change language' }))

    await waitFor(() => expect(navigation.router.push).toHaveBeenCalledWith('/archive/'))
    expect(getCategories).toHaveBeenCalledWith({ locale: 'es' })
  })
})
