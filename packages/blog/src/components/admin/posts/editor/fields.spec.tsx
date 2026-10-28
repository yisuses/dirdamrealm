import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { renderWithProviders } from '@blog/test/render'

import { CategoriesField } from './CategoriesField'
import { CoverField } from './CoverField'

const cover = { publicId: 'portada_1', width: 1200, height: 800, alt: 'El estadio' }
const options = [
  { id: 'a', name: 'Actualidad' },
  { id: 'd', name: 'Deportes' },
  { id: 'v', name: 'Viajes' },
]

describe('CoverField', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME', 'demo')
  })

  it('should offer to choose a cover when there is none', async () => {
    const user = userEvent.setup()
    const onChoose = vi.fn()
    renderWithProviders(<CoverField cover={null} onChoose={onChoose} onChange={vi.fn()} />)

    expect(screen.getByText(/Sin portada/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Elegir la portada' }))
    expect(onChoose).toHaveBeenCalled()
  })

  it('should show the cover, edit its description, change it or remove it', async () => {
    const user = userEvent.setup()
    const onChoose = vi.fn()
    const onChange = vi.fn()
    renderWithProviders(<CoverField cover={cover} onChoose={onChoose} onChange={onChange} />)

    expect(screen.getByRole('img', { name: 'El estadio' })).toHaveAttribute(
      'src',
      'https://res.cloudinary.com/demo/image/upload/c_limit,w_400,h_300,f_auto,q_auto/portada_1',
    )
    fireEvent.change(screen.getByLabelText('Descripción de la portada'), { target: { value: 'Lleno' } })
    expect(onChange).toHaveBeenLastCalledWith({ ...cover, alt: 'Lleno' })
    await user.click(screen.getByRole('button', { name: 'Cambiar la portada' }))
    expect(onChoose).toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Quitar la portada' }))
    expect(onChange).toHaveBeenLastCalledWith(null)
  })

  it('should mark the part of the cover to keep, by pointer or arrow keys, and go back to the centre', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const { rerender } = renderWithProviders(<CoverField cover={cover} onChoose={vi.fn()} onChange={onChange} />)

    expect(screen.getByTestId('cover-focus')).toHaveStyle({ left: '50%', top: '50%' })
    expect(screen.queryByRole('button', { name: 'Volver a centrar' })).not.toBeInTheDocument()
    const image = screen.getByRole('img', { name: 'El estadio' })
    image.getBoundingClientRect = () => ({ left: 10, top: 20, width: 200, height: 100 }) as DOMRect
    fireEvent.click(image, { clientX: 60, clientY: 140 })
    expect(onChange).toHaveBeenLastCalledWith({ ...cover, focus: { x: 25, y: 100 } })

    const picker = screen.getByRole('group', { name: /Parte más importante/ })
    fireEvent.keyDown(picker, { key: 'ArrowLeft' })
    expect(onChange).toHaveBeenLastCalledWith({ ...cover, focus: { x: 45, y: 50 } })
    onChange.mockClear()
    fireEvent.keyDown(picker, { key: 'Enter' })
    expect(onChange).not.toHaveBeenCalled()

    const framed = { ...cover, focus: { x: 100, y: 0 } }
    rerender(<CoverField cover={framed} onChoose={vi.fn()} onChange={onChange} />)
    expect(screen.getByTestId('cover-focus')).toHaveStyle({ left: '100%', top: '0%' })
    fireEvent.keyDown(picker, { key: 'ArrowRight' })
    fireEvent.keyDown(picker, { key: 'ArrowUp' })
    expect(onChange).toHaveBeenLastCalledWith({ ...cover, focus: { x: 100, y: 0 } })
    fireEvent.keyDown(picker, { key: 'ArrowDown' })
    expect(onChange).toHaveBeenLastCalledWith({ ...cover, focus: { x: 100, y: 5 } })
    await user.click(screen.getByRole('button', { name: 'Volver a centrar' }))
    expect(onChange).toHaveBeenLastCalledWith({ ...cover, focus: undefined })
  })

  it('should preview the cover as the site frames it, and show it whole on request', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const framed = { ...cover, focus: { x: 30, y: 10 } }
    const { rerender } = renderWithProviders(<CoverField cover={framed} onChoose={vi.fn()} onChange={onChange} />)

    for (const name of ['en el ordenador', 'en el móvil', 'en las listas']) {
      const preview = screen.getByRole('img', { name: `Vista previa de la portada ${name}` })
      expect(preview).toHaveAttribute(
        'src',
        'https://res.cloudinary.com/demo/image/upload/c_limit,w_900,h_900,f_auto,q_auto/portada_1',
      )
      expect(preview).toHaveStyle({ objectFit: 'cover', objectPosition: '30% 10%' })
    }

    await user.click(screen.getByText('Mostrar la foto entera, sin recortar'))
    expect(onChange).toHaveBeenLastCalledWith({ ...framed, fit: 'contain' })

    rerender(<CoverField cover={{ ...framed, fit: 'contain' }} onChoose={vi.fn()} onChange={onChange} />)
    expect(screen.getByRole('img', { name: 'Vista previa de la portada en el móvil' })).toHaveStyle({
      objectFit: 'contain',
    })
    await user.click(screen.getByText('Mostrar la foto entera, sin recortar'))
    expect(onChange).toHaveBeenLastCalledWith({ ...framed, fit: 'cover' })
  })

  it('should show an empty description for a cover without one', () => {
    renderWithProviders(<CoverField cover={{ ...cover, alt: undefined }} onChoose={vi.fn()} onChange={vi.fn()} />)

    expect(screen.getByLabelText('Descripción de la portada')).toHaveValue('')
  })
})

describe('CategoriesField', () => {
  it('should add and remove categories, keeping their order', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderWithProviders(<CategoriesField options={options} value={['d']} onChange={onChange} />)

    expect(screen.queryByLabelText('Categoría principal')).not.toBeInTheDocument()
    await user.click(screen.getByText('Viajes'))
    expect(onChange).toHaveBeenLastCalledWith(['d', 'v'])
    await user.click(screen.getByText('Deportes'))
    expect(onChange).toHaveBeenLastCalledWith([])
  })

  it('should choose the main category, which goes first', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderWithProviders(<CategoriesField options={options} value={['d', 'v', 'gone']} onChange={onChange} />)

    const main = screen.getByLabelText('Categoría principal')
    expect(main).toHaveValue('d')
    expect(screen.getAllByRole('option').map(option => option.textContent)).toEqual(['Deportes', 'Viajes', ''])
    await user.selectOptions(main, 'v')
    expect(onChange).toHaveBeenLastCalledWith(['v', 'd', 'gone'])
  })
})
