import type { API, BlockAPI, BlockTool, PasteEvent } from '@editorjs/editorjs'

import type { LibraryImage } from '@blog/core/cloudinary/libraryImage'

import { originalUrl } from '../../images/images'

export interface ImageToolConfig {
  /** Opens the library to choose (or upload) an image; null when closed without one. */
  pickImage: () => Promise<LibraryImage | null>
  /** Uploads a pasted or dropped file, or the image at a pasted address. */
  uploadImage: (source: File | string) => Promise<LibraryImage>
}

/**
 * The site shows `file.url` at `file.width` × `file.height`, with `caption` underneath and as its
 * description. Images from Strapi carry many more fields, which are kept as they are.
 */
export interface ImageBlockData {
  file?: { url: string; width: number; height: number; publicId?: string; [key: string]: unknown }
  caption?: string
  [key: string]: unknown
}

const icon =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><rect width="14" height="14" x="5" y="5" stroke="currentColor" stroke-width="2" rx="4"/><path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M5.13 15.6 8 13l3 3 3.5-3.5 4.4 4"/></svg>'

function element<K extends keyof HTMLElementTagNameMap>(tag: K, props: Record<string, unknown> = {}) {
  const node = document.createElement(tag)
  Object.assign(node, props)
  return node
}

/** The image block: from the library, uploaded from the computer, pasted or dropped. */
export class ImageTool implements BlockTool {
  static get toolbox() {
    return { title: 'Image', icon }
  }

  static get pasteConfig() {
    return {
      files: { mimeTypes: ['image/*'] },
      patterns: { image: /^https?:\/\/\S+\.(?:gif|jpe?g|png|webp|avif)(?:\?\S*)?$/i },
    }
  }

  private data: ImageBlockData
  private readonly config: ImageToolConfig
  private readonly api: API
  private readonly block?: BlockAPI
  private readonly wrapper = element('div')
  private caption?: HTMLTextAreaElement
  private state: 'idle' | 'uploading' | 'failed' = 'idle'

  constructor({
    data,
    config,
    api,
    block,
  }: {
    data: ImageBlockData
    config: ImageToolConfig
    api: API
    block?: BlockAPI
  }) {
    this.data = data
    this.config = config
    this.api = api
    this.block = block
  }

  render() {
    this.draw()
    return this.wrapper
  }

  save(): ImageBlockData {
    return { ...this.data, caption: this.caption?.value ?? this.data.caption ?? '' }
  }

  /** An image block without an image is dropped when saving. */
  validate(data: ImageBlockData) {
    return Boolean(data.file?.url)
  }

  onPaste(event: PasteEvent) {
    if (event.type === 'file') {
      void this.upload((event.detail as { file: File }).file)
    } else if (event.type === 'pattern') {
      void this.upload((event.detail as { data: string }).data)
    }
  }

  private button(label: string, onClick: () => void) {
    const button = element('button', { type: 'button', className: this.api.styles.button, textContent: label })
    button.addEventListener('click', onClick)
    return button
  }

  private draw() {
    this.wrapper.replaceChildren()
    this.wrapper.style.cssText = 'display:flex;flex-direction:column;gap:12px;padding:12px 0'

    if (this.state === 'uploading') {
      this.wrapper.append(element('p', { textContent: 'Subiendo la imagen…', role: 'status' }))
      return
    }

    const file = this.data.file
    if (file?.url) {
      const image = element('img', { src: file.url, alt: this.data.caption ?? '' })
      image.style.cssText = 'max-width:100%;max-height:480px;object-fit:contain;align-self:center'
      this.caption = element('textarea', {
        className: this.api.styles.input,
        value: this.data.caption ?? '',
        placeholder: 'Pie de foto: qué se ve en la imagen',
        rows: 2,
      })
      this.caption.style.resize = 'vertical'
      this.caption.setAttribute('aria-label', 'Pie de foto')
      this.wrapper.append(
        image,
        this.caption,
        this.button('Cambiar la imagen', () => void this.choose()),
      )
      return
    }

    const fileInput = element('input', { type: 'file', accept: 'image/*', hidden: true })
    fileInput.addEventListener('change', () => {
      if (fileInput.files?.[0]) {
        void this.upload(fileInput.files[0])
      }
    })
    const actions = element('div')
    actions.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px'
    actions.append(
      this.button('Elegir de la biblioteca', () => void this.choose()),
      this.button('Subir desde el ordenador', () => fileInput.click()),
      fileInput,
    )
    const hint = element('p', {
      textContent:
        this.state === 'failed'
          ? 'No se ha podido subir la imagen. Vuelve a probar.'
          : 'También puedes arrastrar una imagen aquí o pegarla.',
    })
    this.wrapper.append(actions, hint)
  }

  private setImage(image: LibraryImage) {
    this.data = {
      ...this.data,
      file: { url: originalUrl(image.publicId), width: image.width, height: image.height, publicId: image.publicId },
      caption: this.caption?.value || this.data.caption || image.alt,
    }
    this.state = 'idle'
    this.draw()
    this.block?.dispatchChange()
  }

  private async choose() {
    const image = await this.config.pickImage()
    if (image) {
      this.setImage(image)
    }
  }

  private async upload(source: File | string) {
    this.state = 'uploading'
    this.draw()
    try {
      this.setImage(await this.config.uploadImage(source))
    } catch {
      this.state = 'failed'
      this.draw()
    }
  }
}
