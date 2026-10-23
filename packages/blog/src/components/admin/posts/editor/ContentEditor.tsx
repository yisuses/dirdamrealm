'use client'

import { Box, Spinner } from '@chakra-ui/react'
import type EditorJS from '@editorjs/editorjs'
import type { OutputBlockData } from '@editorjs/editorjs'
import type { DataProp } from 'editorjs-blocks-react-renderer'
import { type Ref, useEffect, useImperativeHandle, useRef, useState } from 'react'

import type { LibraryImage } from '@blog/core/cloudinary/libraryImage'

import { nameFromFile, uploadImage } from '../../images/images'
import { editorMessages } from './editorI18n'

export interface ContentEditorHandle {
  /** Adds blocks after the last one (the Word import). */
  append: (blocks: OutputBlockData[]) => Promise<void>
}

interface ContentEditorProps {
  initialContent: DataProp
  onChange: (content: DataProp) => void
  pickImage: () => Promise<LibraryImage | null>
  ref?: Ref<ContentEditorHandle>
}

/** A name for an image pasted as a file or as its web address. */
function pastedImageName(source: File | string) {
  if (typeof source !== 'string') {
    return nameFromFile(source) || 'imagen'
  }
  const { pathname } = new URL(source)
  const file = pathname.slice(pathname.lastIndexOf('/') + 1)
  return nameFromFile(new File([], decodeURIComponent(file))) || 'imagen'
}

/**
 * EditorJS, loaded in the browser only. It reads `initialContent` once: the editor page remounts
 * it (by key) when the language or its published state changes.
 */
export function ContentEditor({ initialContent, onChange, pickImage, ref }: ContentEditorProps) {
  const holder = useRef<HTMLDivElement>(null)
  const editor = useRef<EditorJS | null>(null)
  const callbacks = useRef({ onChange, pickImage })
  callbacks.current = { onChange, pickImage }
  const [ready, setReady] = useState(false)
  // undefined while loading; null once edited, when every change counts.
  const baseline = useRef<string | null | undefined>(undefined)

  useImperativeHandle(ref, () => ({
    append: async blocks => {
      const instance = editor.current!
      for (const block of blocks) {
        instance.blocks.insert(block.type, block.data, undefined, instance.blocks.getBlocksCount(), false)
      }
      baseline.current = null
      callbacks.current.onChange(toContent(await instance.save()))
    },
  }))

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const [{ default: EditorJSClass }, { buildEditorTools }] = await Promise.all([
        import('@editorjs/editorjs'),
        import('./editorTools'),
      ])
      if (cancelled) {
        return
      }
      const instance = new EditorJSClass({
        holder: holder.current!,
        data: initialContent,
        tools: buildEditorTools({
          pickImage: () => callbacks.current.pickImage(),
          uploadImage: source => uploadImage(source, { name: pastedImageName(source), alt: '' }, () => undefined),
        }),
        i18n: { messages: editorMessages },
        placeholder: 'Escribe aquí el texto de la entrada. Pulsa + para añadir títulos, imágenes, listas…',
        minHeight: 150,
        // EditorJS tidies what it loads (block ids, old list formats) and reports that as a change.
        // What it holds right after loading is the baseline: only a different content is an edit.
        onReady: async () => {
          baseline.current = signature(await instance.save())
          setReady(true)
        },
        onChange: async api => {
          const output = await api.saver.save()
          if (baseline.current === undefined || signature(output) === baseline.current) {
            return
          }
          baseline.current = null
          callbacks.current.onChange(toContent(output))
        },
      })
      editor.current = instance
    })()
    return () => {
      cancelled = true
      const instance = editor.current
      editor.current = null
      void instance?.isReady.then(() => instance.destroy()).catch(() => undefined)
    }
  }, [])

  return (
    <Box bg="white" borderWidth={1} borderRadius="lg" px={{ base: 4, md: 16 }} py={6} position="relative" fontSize="lg">
      {!ready && <Spinner aria-label="Cargando el editor" position="absolute" top={6} left="50%" />}
      <Box ref={holder} data-testid="content-editor" css={editorStyles} />
    </Box>
  )
}

// Chakra's reset strips headings, lists and quotes of their look; give the blocks back one close
// to the site's, so the text reads as it will be published.
const editorStyles = {
  '& .ce-header': { fontFamily: 'Roboto', fontWeight: 'bold', color: 'inherit', lineHeight: 1.3, py: 2 },
  '& h2.ce-header': { fontSize: '1.75rem' },
  '& h3.ce-header': { fontSize: '1.4rem' },
  '& .ce-paragraph': { lineHeight: 1.7 },
  '& .cdx-quote__text': {
    color: 'inherit',
    fontStyle: 'italic',
    borderLeft: '4px solid',
    borderColor: 'orange.300',
    ps: 4,
    minH: 'auto',
  },
  '& .cdx-quote__caption': { fontSize: 'md' },
  '& a': { color: 'orange.700', textDecoration: 'underline' },
  '& .ce-block--selected .ce-block__content': { bg: 'orange.50' },
}

function signature(output: { blocks: OutputBlockData[] }) {
  return JSON.stringify(output.blocks.map(({ type, data }) => ({ type, data })))
}

function toContent(output: { time?: number; version?: string; blocks: OutputBlockData[] }): DataProp {
  return { time: output.time ?? Date.now(), version: output.version ?? '', blocks: output.blocks } as DataProp
}
