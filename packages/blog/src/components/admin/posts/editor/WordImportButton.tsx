'use client'

import { Box, Button, Stack, VisuallyHidden } from '@chakra-ui/react'
import type { OutputBlockData } from '@editorjs/editorjs'
import { useRef, useState } from 'react'

import { ConfirmDialog } from '@blog/components/admin/ui/ConfirmDialog'

import { wordToBlocks } from './wordImport'

interface WordImportButtonProps {
  onImport: (blocks: OutputBlockData[]) => Promise<void>
}

/** Adds a Word document's text, as paragraphs, at the end of the post. */
export function WordImportButton({ onImport }: WordImportButtonProps) {
  const input = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  async function importFile() {
    setBusy(true)
    setMessage(null)
    try {
      const blocks = await wordToBlocks(file!)
      await onImport(blocks)
      setMessage({
        ok: true,
        text: `${blocks.length === 1 ? 'Añadido 1 párrafo' : `Añadidos ${blocks.length} párrafos`} al final del texto. Repásalo antes de publicar.`,
      })
    } catch {
      setMessage({ ok: false, text: 'No se ha podido leer el documento. Comprueba que es un archivo de Word (.docx).' })
    } finally {
      setBusy(false)
      setFile(null)
    }
  }

  return (
    <Stack gap={3}>
      <VisuallyHidden asChild>
        <input
          ref={input}
          type="file"
          accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          aria-label="Elegir un documento de Word"
          onChange={event => {
            setFile(event.target.files?.[0] ?? null)
            event.target.value = ''
          }}
        />
      </VisuallyHidden>
      <Button
        variant="outline"
        bg="white"
        alignSelf="flex-start"
        loading={busy}
        loadingText="Importando…"
        onClick={() => input.current?.click()}
      >
        Importar un documento de Word
      </Button>
      {message && (
        <Box
          role="status"
          bg={message.ok ? 'green.50' : 'red.50'}
          color={message.ok ? 'green.900' : 'red.900'}
          p={3}
          borderRadius="md"
        >
          {message.text}
        </Box>
      )}
      <ConfirmDialog
        open={Boolean(file) && !busy}
        title={`¿Añadir «${file?.name ?? ''}»?`}
        confirmLabel="Sí, añadirlo"
        confirmPalette="orange"
        onConfirm={() => void importFile()}
        onCancel={() => setFile(null)}
      >
        Su texto se añadirá al final de la entrada, en párrafos, con sus negritas, cursivas y enlaces. Las imágenes del
        documento no se añaden. Lo que ya has escrito no se toca.
      </ConfirmDialog>
    </Stack>
  )
}
