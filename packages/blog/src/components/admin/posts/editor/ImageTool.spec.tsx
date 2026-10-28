import type { API, BlockAPI, PasteEvent } from '@editorjs/editorjs'
import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { LibraryImage } from '@blog/core/cloudinary/libraryImage'

import { type ImageBlockData, ImageTool, type ImageToolConfig } from './ImageTool'

const api = { styles: { button: 'cdx-button', input: 'cdx-input' } } as unknown as API
const image: LibraryImage = {
  publicId: 'aguila_1',
  name: 'Águila',
  alt: 'Un águila',
  width: 1200,
  height: 500,
  format: 'jpg',
  bytes: 1,
  createdAt: '2026-10-22T10:00:00Z',
}

function mount(data: ImageBlockData, config: Partial<ImageToolConfig> = {}, block?: BlockAPI) {
  const tool = new ImageTool({
    data,
    config: { pickImage: vi.fn(async () => null), uploadImage: vi.fn(async () => image), ...config },
    api,
    block,
  })
  const wrapper = tool.render()
  document.body.replaceChildren(wrapper)
  return { tool, wrapper: within(wrapper) }
}

const paste = (type: string, detail: object) => ({ type, detail }) as unknown as PasteEvent

describe('ImageTool', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME', 'demo')
  })

  it('should offer itself in the toolbox and take pasted image files and addresses', () => {
    expect(ImageTool.toolbox).toEqual({ title: 'Image', icon: expect.stringContaining('<svg') })
    const { files, patterns } = ImageTool.pasteConfig
    expect(files.mimeTypes).toEqual(['image/*'])
    expect(patterns.image.test('https://example.com/foto.JPG?w=1')).toBe(true)
    expect(patterns.image.test('https://example.com/pagina.html')).toBe(false)
  })

  it('should show an existing image with its caption and save the edited caption, keeping Strapi fields', () => {
    const data = {
      file: { url: 'https://x/a.png', width: 1, height: 1, hash: 'a' },
      caption: 'Antes',
      stretched: false,
    }
    const { tool, wrapper } = mount(data)

    expect(wrapper.getByRole('img')).toHaveAttribute('src', 'https://x/a.png')
    expect(wrapper.getByRole('img')).toHaveAttribute('alt', 'Antes')
    const caption = wrapper.getByLabelText('Pie de foto')
    fireEvent.input(caption, { target: { value: 'Después' } })
    expect(tool.save()).toEqual({ ...data, caption: 'Después' })
    expect(tool.validate(tool.save())).toBe(true)
  })

  it('should show an image without caption, and drop blocks without an image', () => {
    const { tool, wrapper } = mount({ file: { url: 'https://x/a.png', width: 1, height: 1 } })

    expect(document.querySelector('img')).toHaveAttribute('alt', '')
    expect(wrapper.getByLabelText('Pie de foto')).toHaveValue('')
    expect(tool.validate({})).toBe(false)
  })

  it('should offer the library and an upload when empty, saving an empty caption', () => {
    const { tool, wrapper } = mount({})

    expect(wrapper.getByRole('button', { name: 'Elegir de la biblioteca' })).toHaveClass('cdx-button')
    expect(wrapper.getByText('También puedes arrastrar una imagen aquí o pegarla.')).toBeInTheDocument()
    expect(tool.save()).toEqual({ caption: '' })
    expect(mount({ caption: 'Guardado' }).tool.save()).toEqual({ caption: 'Guardado' })
  })

  it('should set an image chosen from the library, with its description as caption', async () => {
    const dispatchChange = vi.fn()
    const pickImage = vi.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(image)
    const { tool, wrapper } = mount({}, { pickImage }, { dispatchChange } as unknown as BlockAPI)

    fireEvent.click(wrapper.getByRole('button', { name: 'Elegir de la biblioteca' }))
    await waitFor(() => expect(pickImage).toHaveBeenCalledTimes(1))
    expect(wrapper.queryByRole('img')).not.toBeInTheDocument()

    fireEvent.click(wrapper.getByRole('button', { name: 'Elegir de la biblioteca' }))
    expect(await screen.findByRole('img')).toHaveAttribute(
      'src',
      'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto/aguila_1',
    )
    expect(tool.save()).toEqual({
      file: {
        url: 'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto/aguila_1',
        width: 1200,
        height: 500,
        publicId: 'aguila_1',
      },
      caption: 'Un águila',
    })
    expect(dispatchChange).toHaveBeenCalledTimes(1)
  })

  it('should keep a written caption when changing the image', async () => {
    const { tool } = mount({ file: { url: 'https://x/a.png', width: 1, height: 1 } }, { pickImage: async () => image })

    fireEvent.input(screen.getByLabelText('Pie de foto'), { target: { value: 'Mi pie' } })
    fireEvent.click(screen.getByRole('button', { name: 'Cambiar la imagen' }))

    await waitFor(() => expect(tool.save().file?.publicId).toBe('aguila_1'))
    expect(tool.save().caption).toBe('Mi pie')
  })

  it('should keep the saved caption over the image description', async () => {
    const { tool } = mount({ caption: 'Del bloque' }, { pickImage: async () => image })

    fireEvent.click(screen.getByRole('button', { name: 'Elegir de la biblioteca' }))

    await waitFor(() => expect(tool.save().caption).toBe('Del bloque'))
  })

  it('should upload a file chosen from the computer, saying so meanwhile', async () => {
    let finish: (value: LibraryImage) => void = () => undefined
    const uploadImage = vi.fn(() => new Promise<LibraryImage>(resolve => (finish = resolve)))
    const { wrapper } = mount({}, { uploadImage })
    const input = document.querySelector<HTMLInputElement>('input[type=file]')!
    const click = vi.spyOn(input, 'click')

    fireEvent.click(wrapper.getByRole('button', { name: 'Subir desde el ordenador' }))
    expect(click).toHaveBeenCalled()
    fireEvent.change(input, { target: { files: [] } })
    expect(uploadImage).not.toHaveBeenCalled()

    const file = new File(['x'], 'foto.png', { type: 'image/png' })
    fireEvent.change(input, { target: { files: [file] } })
    expect(uploadImage).toHaveBeenCalledWith(file)
    expect(screen.getByRole('status')).toHaveTextContent('Subiendo la imagen…')

    finish(image)
    expect(await screen.findByRole('img')).toBeInTheDocument()
  })

  it('should upload pasted files and image addresses, and say when an upload fails', async () => {
    const uploadImage = vi.fn().mockRejectedValueOnce(new Error('network')).mockResolvedValueOnce(image)
    const { tool } = mount({}, { uploadImage })
    const file = new File(['x'], 'foto.png', { type: 'image/png' })

    tool.onPaste(paste('file', { file }))
    expect(await screen.findByText('No se ha podido subir la imagen. Vuelve a probar.')).toBeInTheDocument()

    tool.onPaste(paste('pattern', { data: 'https://example.com/foto.jpg' }))
    expect(await screen.findByRole('img')).toBeInTheDocument()
    expect(uploadImage).toHaveBeenLastCalledWith('https://example.com/foto.jpg')

    tool.onPaste(paste('tag', {}))
    expect(uploadImage).toHaveBeenCalledTimes(2)
  })
})
