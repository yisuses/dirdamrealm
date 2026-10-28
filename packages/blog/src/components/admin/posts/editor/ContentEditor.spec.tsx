import { act, screen, waitFor } from '@testing-library/react'
import { createRef } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { uploadImage } from '@blog/components/admin/images/images'
import { renderWithProviders } from '@blog/test/render'

import { ContentEditor, type ContentEditorHandle } from './ContentEditor'
import type { ImageToolConfig } from './ImageTool'
import { buildEditorTools } from './editorTools'

type Output = { time?: number; version?: string; blocks: { type: string; data: object }[] }

const fake = vi.hoisted(() => {
  const state = {
    instances: [] as {
      config: {
        holder: HTMLElement
        data: unknown
        onReady: () => Promise<void>
        onChange: (api: { saver: { save: () => Promise<unknown> } }) => Promise<void>
        [key: string]: unknown
      }
      save: ReturnType<typeof import('vitest').vi.fn>
      destroy: ReturnType<typeof import('vitest').vi.fn>
      blocks: {
        insert: ReturnType<typeof import('vitest').vi.fn>
        delete: ReturnType<typeof import('vitest').vi.fn>
        getBlocksCount: () => number
        getCurrentBlockIndex: ReturnType<typeof import('vitest').vi.fn>
        getBlockByIndex: ReturnType<typeof import('vitest').vi.fn>
      }
      isReady: Promise<void>
    }[],
    ready: Promise.resolve() as Promise<void>,
  }
  return state
})

vi.mock('@editorjs/editorjs', async () => {
  const { vi: mocks } = await import('vitest')
  return {
    default: class {
      config: unknown
      save = mocks.fn()
      destroy = mocks.fn()
      blocks = {
        insert: mocks.fn(),
        delete: mocks.fn(),
        getBlocksCount: () => 2,
        getCurrentBlockIndex: mocks.fn(() => 0),
        getBlockByIndex: mocks.fn(() => ({ isEmpty: false })),
      }
      isReady = fake.ready
      constructor(config: unknown) {
        this.config = config
        fake.instances.push(this as never)
      }
    },
  }
})
vi.mock('./editorTools', () => ({ buildEditorTools: vi.fn(() => ({ tools: true })) }))
vi.mock('@blog/components/admin/images/images', async importOriginal => ({
  ...(await importOriginal<typeof import('@blog/components/admin/images/images')>()),
  uploadImage: vi.fn(async () => ({ publicId: 'subida' })),
}))

const initial = { time: 1, version: '2', blocks: [{ type: 'paragraph', data: { text: 'Hola' } }] }
const output = (text: string, extra: Partial<Output> = {}): Output => ({
  time: 5,
  version: '2.31',
  blocks: [{ type: 'paragraph', data: { text } }],
  ...extra,
})
const changeWith = (value: Output) => ({ saver: { save: async () => value } })

async function mountEditor(props: Partial<Parameters<typeof ContentEditor>[0]> = {}) {
  const onChange = vi.fn()
  const pickImage = vi.fn(async () => null)
  const ref = createRef<ContentEditorHandle>()
  const view = renderWithProviders(
    <ContentEditor initialContent={initial as never} onChange={onChange} pickImage={pickImage} ref={ref} {...props} />,
  )
  await waitFor(() => expect(fake.instances).toHaveLength(1))
  const instance = fake.instances[0]!
  return { ...view, onChange, pickImage, ref, instance }
}

async function ready(instance: (typeof fake.instances)[number], loaded = output('Hola')) {
  instance.save.mockResolvedValueOnce(loaded)
  await act(() => instance.config.onReady())
}

describe('ContentEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fake.instances.length = 0
    fake.ready = Promise.resolve()
  })

  it('should load EditorJS in the browser with the post, the tools and the Spanish texts', async () => {
    const { instance } = await mountEditor()

    expect(screen.getByLabelText('Cargando el editor')).toBeInTheDocument()
    // Field by field: a failing match on the whole config would print the DOM node.
    expect(instance.config.holder).toBe(screen.getByTestId('content-editor'))
    expect(instance.config.data).toBe(initial)
    expect(instance.config.tools).toBe(vi.mocked(buildEditorTools).mock.results[0]!.value)
    expect((instance.config.i18n as { messages: { toolNames: object } }).messages.toolNames).toMatchObject({
      Text: 'Párrafo',
    })
    expect(instance.config.minHeight).toBe(150)
    await ready(instance)
    expect(screen.queryByLabelText('Cargando el editor')).not.toBeInTheDocument()
  })

  it('should ignore what EditorJS reports while loading or when nothing really changed', async () => {
    const { instance, onChange } = await mountEditor()

    await act(() => instance.config.onChange(changeWith(output('Tidied while loading'))))
    await ready(instance)
    // Same blocks, new ids and time: not an edit.
    await act(() => instance.config.onChange(changeWith(output('Hola', { time: 99 }))))

    expect(onChange).not.toHaveBeenCalled()
  })

  it('should report real edits, and every change after the first one', async () => {
    const { instance, onChange } = await mountEditor()
    await ready(instance)

    await act(() => instance.config.onChange(changeWith(output('Hola, mundo'))))
    await act(() => instance.config.onChange(changeWith({ blocks: [{ type: 'paragraph', data: { text: 'Hola' } }] })))

    expect(onChange).toHaveBeenNthCalledWith(1, output('Hola, mundo'))
    expect(onChange).toHaveBeenNthCalledWith(2, {
      time: expect.any(Number),
      version: '',
      blocks: [{ type: 'paragraph', data: { text: 'Hola' } }],
    })
  })

  it('should append blocks at the end and report the result', async () => {
    const { instance, onChange, ref } = await mountEditor()
    await ready(instance)
    instance.save.mockResolvedValueOnce(output('Con Word'))

    await act(() =>
      ref.current!.append([
        { type: 'paragraph', data: { text: 'Uno' } },
        { type: 'paragraph', data: { text: 'Dos' } },
      ]),
    )

    expect(instance.blocks.insert).toHaveBeenNthCalledWith(1, 'paragraph', { text: 'Uno' }, undefined, 2, false)
    expect(instance.blocks.insert).toHaveBeenNthCalledWith(2, 'paragraph', { text: 'Dos' }, undefined, 3, false)
    expect(instance.blocks.delete).not.toHaveBeenCalled()
    expect(onChange).toHaveBeenCalledWith(output('Con Word'))
  })

  describe('pasting lists copied from Word', () => {
    const wordList =
      '<p class=MsoListParagraph style="mso-list:l0 level1 lfo1"><span style="mso-list:Ignore">·&nbsp;&nbsp;</span>Uno</p>' +
      '<p class=MsoListParagraph style="mso-list:l0 level1 lfo1"><span style="mso-list:Ignore">·&nbsp;&nbsp;</span>Dos</p>'
    const list = {
      style: 'unordered',
      meta: {},
      items: [
        { content: 'Uno', meta: {}, items: [] },
        { content: 'Dos', meta: {}, items: [] },
      ],
    }

    async function readyToPaste() {
      const mounted = await mountEditor()
      await ready(mounted.instance)
      mounted.instance.save.mockResolvedValue(output('Con lista'))
      return mounted
    }

    function paste(html: string) {
      const event = new Event('paste', { bubbles: true, cancelable: true })
      Object.defineProperty(event, 'clipboardData', {
        value: { getData: (type: string) => (type === 'text/html' ? html : '') },
      })
      screen.getByTestId('content-editor').dispatchEvent(event)
      return event
    }

    it('should add them as a real list after the block being written', async () => {
      const { instance, onChange } = await readyToPaste()

      const event = paste(wordList)

      expect(event.defaultPrevented).toBe(true)
      expect(instance.blocks.insert).toHaveBeenCalledWith('list', list, undefined, 1, false)
      await waitFor(() => expect(onChange).toHaveBeenCalledWith(output('Con lista')))
    })

    it('should take the place of the empty block being written', async () => {
      const { instance } = await readyToPaste()
      instance.blocks.getBlockByIndex.mockReturnValueOnce({ isEmpty: true }).mockReturnValueOnce({ isEmpty: true })

      paste(wordList)

      expect(instance.blocks.insert).toHaveBeenCalledWith('list', list, undefined, 1, false)
      expect(instance.blocks.delete).toHaveBeenCalledWith(0)
    })

    it('should add them at the end when no block is being written', async () => {
      const { instance } = await readyToPaste()
      instance.blocks.getCurrentBlockIndex.mockReturnValueOnce(-1)

      paste(wordList)

      expect(instance.blocks.insert).toHaveBeenCalledWith('list', list, undefined, 2, false)
    })

    it("should leave any other paste to EditorJS, and stop listening once it's gone", async () => {
      const { instance, unmount } = await readyToPaste()

      expect(paste('<p>Solo texto</p>').defaultPrevented).toBe(false)
      expect(paste('').defaultPrevented).toBe(false)
      const holder = screen.getByTestId('content-editor')
      unmount()
      const event = new Event('paste', { cancelable: true })
      Object.defineProperty(event, 'clipboardData', { value: { getData: () => wordList } })
      holder.dispatchEvent(event)
      expect(event.defaultPrevented).toBe(false)
      expect(instance.blocks.insert).not.toHaveBeenCalled()
    })
  })

  it("should open the page's picker and upload pasted images with a name from the file or address", async () => {
    const pickImage = vi.fn(async () => null)
    await mountEditor({ pickImage })
    const image = vi.mocked(buildEditorTools).mock.calls[0]![0] as ImageToolConfig

    await image.pickImage()
    expect(pickImage).toHaveBeenCalled()

    const names = []
    for (const source of [
      new File([], 'mi_foto-de.verano.png'),
      new File([], '.png'),
      'https://example.com/fotos/Puerta%20del%20Sol.jpg',
      'https://example.com/',
    ]) {
      await image.uploadImage(source)
      names.push(vi.mocked(uploadImage).mock.lastCall![1].name)
      vi.mocked(uploadImage).mock.lastCall![2](50)
    }
    expect(names).toEqual(['mi foto de.verano', 'imagen', 'Puerta del Sol', 'imagen'])
  })

  it('should destroy the editor when leaving, even if it never got ready', async () => {
    const { instance, unmount } = await mountEditor()

    unmount()
    await waitFor(() => expect(instance.destroy).toHaveBeenCalled())

    fake.ready = Promise.reject(new Error('never ready'))
    fake.ready.catch(() => undefined)
    fake.instances.length = 0
    const second = await mountEditor()
    second.unmount()
    await act(async () => undefined)
    expect(second.instance.destroy).not.toHaveBeenCalled()
  })

  it('should not create the editor when leaving before it loads', async () => {
    const view = renderWithProviders(
      <ContentEditor initialContent={initial as never} onChange={vi.fn()} pickImage={vi.fn()} />,
    )
    view.unmount()
    await act(async () => undefined)

    expect(fake.instances).toHaveLength(0)
  })
})
