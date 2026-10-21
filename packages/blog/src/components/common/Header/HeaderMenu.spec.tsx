import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentProps } from 'react'
import { describe, expect, it, vi } from 'vitest'

import type { DrawerRoot as DrawerRootType } from '@blog/components/ui/drawer'
import { navigation } from '@blog/test/navigation'
import { renderWithProviders } from '@blog/test/render'

import { HeaderMenu } from './HeaderMenu'

const drawer = vi.hoisted(() => ({ props: undefined as ComponentProps<typeof DrawerRootType> | undefined }))

// Pass-through spy: the drawer has no trigger of its own, so the only way to reach its
// `onOpenChange` with `open: true` is to call it directly.
vi.mock('@blog/components/ui/drawer', async importOriginal => {
  const actual = await importOriginal<typeof import('@blog/components/ui/drawer')>()
  return {
    ...actual,
    DrawerRoot: (props: ComponentProps<typeof actual.DrawerRoot>) => {
      drawer.props = props
      return <actual.DrawerRoot {...props} />
    },
  }
})

const categories = [
  { url: '/category/music/', code: 'music', name: 'Music', localizedName: 'Música' },
  { url: '/category/cinema/', code: 'cinema', name: 'Cinema', localizedName: 'Cine' },
]

describe('HeaderMenu', () => {
  it('should render only the menu button while closed', () => {
    const { container } = renderWithProviders(<HeaderMenu categories={categories} />)

    expect(screen.getByRole('button', { name: 'Abrir menú' })).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  it('should open the drawer with the categories and the archive link', async () => {
    const user = userEvent.setup()
    renderWithProviders(<HeaderMenu categories={categories} />)

    await user.click(screen.getByRole('button', { name: 'Abrir menú' }))

    const dialog = await screen.findByRole('dialog')
    expect(screen.getByText('WHITE EMOTION')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Música' })).toHaveAttribute('href', '/category/music/')
    expect(screen.getByRole('link', { name: 'Cine' })).toHaveAttribute('href', '/category/cinema/')
    expect(screen.getByRole('link', { name: 'Archivo' })).toHaveAttribute('href', '/archive/')
    expect(dialog).toMatchSnapshot()
  })

  it('should localize the archive link', async () => {
    navigation.params = { lng: 'en' }
    const user = userEvent.setup()
    renderWithProviders(<HeaderMenu categories={categories} />, { lng: 'en' })

    await user.click(screen.getByRole('button', { name: 'Open menu' }))

    expect(await screen.findByRole('link', { name: 'Archive' })).toHaveAttribute('href', '/en/archive/')
  })

  it.each([
    [
      'the close button',
      async (user: ReturnType<typeof userEvent.setup>) => {
        await user.click(screen.getByRole('button', { name: 'Cerrar menú' }))
      },
    ],
    [
      'a link',
      async (user: ReturnType<typeof userEvent.setup>) => {
        const link = screen.getByRole('link', { name: 'Música' })
        // jsdom cannot navigate; only the close behaviour matters here.
        link.addEventListener('click', event => event.preventDefault())
        await user.click(link)
      },
    ],
    [
      'the escape key',
      async (user: ReturnType<typeof userEvent.setup>) => {
        // The dismiss listeners attach once focus has moved into the drawer.
        await waitFor(() => expect(screen.getByRole('dialog')).toContainElement(document.activeElement as HTMLElement))
        await user.keyboard('{Escape}')
      },
    ],
  ])('should close the drawer with %s', async (_, close) => {
    const user = userEvent.setup()
    renderWithProviders(<HeaderMenu categories={categories} />)
    await user.click(screen.getByRole('button', { name: 'Abrir menú' }))
    await screen.findByRole('dialog')

    await close(user)

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('should ignore open requests coming from the drawer itself', () => {
    renderWithProviders(<HeaderMenu categories={categories} />)

    act(() => drawer.props!.onOpenChange!({ open: true }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
