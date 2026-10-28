import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderWithProviders } from '@blog/test/render'

import { FramedImage } from './FramedImage'

describe('FramedImage', () => {
  it('should fill its box, centred by default', () => {
    renderWithProviders(<FramedImage src="/photo.jpg" alt="Foto" />)

    expect(screen.getAllByRole('img', { hidden: true })).toHaveLength(1)
    expect(screen.getByRole('img', { name: 'Foto' })).toHaveStyle({ objectFit: 'cover' })
    expect(screen.getByRole('img', { name: 'Foto' }).style.objectPosition).toBe('')
  })

  it('should crop around its focus point', () => {
    renderWithProviders(<FramedImage src="/photo.jpg" alt="Foto" focus={{ x: 20, y: 75 }} />)

    expect(screen.getByRole('img', { name: 'Foto' })).toHaveStyle({ objectFit: 'cover', objectPosition: '20% 75%' })
  })

  it('should show the whole image over a blurred, hidden copy of itself', () => {
    const { container } = renderWithProviders(<FramedImage src="/photo.jpg" alt="Foto" fit="contain" />)

    expect(screen.getByRole('img', { name: 'Foto' })).toHaveStyle({ objectFit: 'contain' })
    const backdrop = container.querySelector('img[aria-hidden="true"]') as HTMLImageElement
    expect(backdrop).toHaveAttribute('alt', '')
    expect(backdrop.style.filter).toContain('blur')
    expect(backdrop).toHaveStyle({ objectFit: 'cover' })
  })
})
