import { screen, waitFor } from '@testing-library/react'
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

const ORANGE = 'var(--chakra-colors-orange-300)'
const WHITE = 'var(--chakra-colors-white)'

// The desktop navigation is hidden below the `lg` breakpoint, which is all jsdom has.
const desktopLink = (name: string) => screen.getByRole('link', { name, hidden: true })

describe('Header', () => {
  afterEach(() => {
    theme.resolvedTheme = 'light'
    theme.setTheme.mockReset()
    vi.mocked(getCategories).mockReset()
  })

  it('should render the logo, the navigation and the actions', () => {
    const { container } = renderWithProviders(<Header categories={categories} />)

    const homeLink = screen.getAllByRole('link').find(link => link.textContent === 'WHITE EMOTION')
    expect(homeLink).toHaveAttribute('href', '/')
    expect(screen.getByRole('button', { name: 'Categorías', hidden: true })).toBeInTheDocument()
    expect(
      screen.getAllByRole('link', { name: 'Archivo', hidden: true }).map(link => link.getAttribute('href')),
    ).toEqual(['/archive/'])
    // Mobile and desktop copies of the actions.
    expect(screen.getAllByRole('button', { name: 'Search', hidden: true })).toHaveLength(2)
    expect(screen.getAllByRole('button', { name: 'Toggle theme', hidden: true })).toHaveLength(2)
    expect(screen.getAllByRole('button', { name: 'Cambiar idioma' })[0]).toHaveTextContent('ES')
    expect(container.firstChild).toMatchSnapshot()
  })

  it('should list the categories in the dropdown, highlighting the current one', async () => {
    navigation.pathname = '/category/music/musica/'
    const user = userEvent.setup()
    renderWithProviders(<Header categories={categories} />)

    await user.click(screen.getByRole('button', { name: 'Categorías', hidden: true }))

    expect(await screen.findByRole('menuitem', { name: 'Música', hidden: true })).toHaveAttribute(
      'href',
      '/category/music/musica/',
    )
    expect(screen.getByRole('menuitem', { name: 'Música', hidden: true })).toHaveStyle({ color: ORANGE })
    expect(screen.getByRole('menuitem', { name: 'Cine', hidden: true })).toHaveStyle({ color: WHITE })
    expect(desktopLink('Archivo')).toHaveStyle({ color: WHITE })
  })

  it('should highlight the archive link on a localized archive page', () => {
    navigation.params = { lng: 'en' }
    navigation.pathname = '/en/archive/'
    renderWithProviders(<Header categories={categories} />, { lng: 'en' })

    expect(desktopLink('Archive')).toHaveAttribute('href', '/en/archive/')
    expect(desktopLink('Archive')).toHaveStyle({ color: ORANGE })
    expect(screen.getAllByRole('button', { name: 'Change language' })[0]).toHaveTextContent('EN')
  })

  it.each([['/en'], [null]])('should treat %s as the home page', pathname => {
    navigation.pathname = pathname as string
    renderWithProviders(<Header categories={categories} />)

    expect(desktopLink('Archivo')).toHaveStyle({ color: WHITE })
  })

  it('should open the search modal', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Header categories={categories} />)

    await user.click(screen.getAllByRole('button', { name: 'Search' })[0])

    expect(await screen.findByRole('dialog')).toHaveTextContent('¿Estás buscando algo en concreto? (título)')
    expect(screen.getByRole('textbox', { name: 'Buscar por entrada' })).toHaveAttribute(
      'placeholder',
      'Título de la entrada',
    )
  })

  it('should close the search modal', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Header categories={categories} />)
    await user.click(screen.getAllByRole('button', { name: 'Search' })[0])
    await screen.findByRole('dialog')

    await user.click(screen.getByRole('button', { name: 'Close' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('should switch to dark mode from light mode', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Header categories={categories} />)

    await user.click(screen.getAllByRole('button', { name: 'Toggle theme' })[0])

    expect(theme.setTheme).toHaveBeenCalledWith('dark')
  })

  it('should switch to light mode from dark mode', async () => {
    theme.resolvedTheme = 'dark'
    const user = userEvent.setup()
    const { container } = renderWithProviders(<Header categories={categories} />)

    await user.click(screen.getAllByRole('button', { name: 'Toggle theme' })[0])

    expect(theme.setTheme).toHaveBeenCalledWith('light')
    expect(screen.getAllByRole('button', { name: 'Toggle theme' })[0]).toMatchSnapshot()
    expect(container.firstChild).not.toBeNull()
  })

  it('should prefetch the english categories and switch to english', async () => {
    vi.mocked(getCategories).mockResolvedValue([])
    navigation.pathname = '/archive/'
    const queryClient = createTestQueryClient()
    const user = userEvent.setup()
    renderWithProviders(<Header categories={categories} />, { queryClient })

    await user.click(screen.getAllByRole('button', { name: 'Cambiar idioma' })[0])

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

    await user.click(screen.getAllByRole('button', { name: 'Change language' })[0])

    await waitFor(() => expect(navigation.router.push).toHaveBeenCalledWith('/archive/'))
    expect(getCategories).toHaveBeenCalledWith({ locale: 'es' })
  })
})
