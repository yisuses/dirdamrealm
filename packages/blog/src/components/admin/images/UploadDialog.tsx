'use client'

import { Box, Button, Field, Flex, Image, Input, Progress, Stack, Text } from '@chakra-ui/react'
import { useEffect, useState } from 'react'

import {
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from '@blog/components/ui/dialog'
import type { LibraryImage } from '@blog/core/cloudinary/libraryImage'
import { imageMetaSchema, maxImageBytes } from '@blog/core/validation/image'

import { formatBytes, nameFromFile, uploadImage } from './images'

interface Item {
  key: string
  file: File
  name: string
  alt: string
  status: 'ready' | 'uploading' | 'done' | 'error'
  progress: number
  // Why it cannot be uploaded (too big, not an image) or why the upload failed.
  problem?: string
  nameError?: string
  altError?: string
}

function toItem(file: File, index: number): Item {
  const problem = !file.type.startsWith('image/')
    ? 'No es una imagen.'
    : file.size > maxImageBytes
      ? `Pesa ${formatBytes(file.size)}: el máximo es ${formatBytes(maxImageBytes)}.`
      : undefined
  return {
    key: `${index}-${file.name}-${file.lastModified}`,
    file,
    name: nameFromFile(file),
    alt: '',
    status: problem ? 'error' : 'ready',
    progress: 0,
    problem,
  }
}

interface UploadDialogProps {
  files: File[]
  onUploaded: (image: LibraryImage) => void
  onClose: () => void
}

/** Names, describes and uploads the chosen files one after another, each with its own progress. */
export function UploadDialog({ files, onUploaded, onClose }: UploadDialogProps) {
  const [items, setItems] = useState(() => files.map(toItem))
  const [uploading, setUploading] = useState(false)
  const [previews, setPreviews] = useState<Record<string, string>>({})

  // Local previews of the chosen files, released when the dialog closes.
  useEffect(() => {
    const urls = Object.fromEntries(
      items.filter(item => item.status !== 'error').map(item => [item.key, URL.createObjectURL(item.file)]),
    )
    setPreviews(urls)
    return () => Object.values(urls).forEach(url => URL.revokeObjectURL(url))
  }, [files])

  const update = (key: string, changes: Partial<Item>) =>
    setItems(current => current.map(item => (item.key === key ? { ...item, ...changes } : item)))

  const pending = items.filter(item => item.status === 'ready')
  const finished = items.length > 0 && items.every(item => item.status === 'done' || item.status === 'error')

  async function uploadAll() {
    let valid = true
    for (const item of pending) {
      const parsed = imageMetaSchema.safeParse({ name: item.name, alt: item.alt })
      const errors = parsed.error?.flatten().fieldErrors
      update(item.key, { nameError: errors?.name?.[0], altError: errors?.alt?.[0] })
      valid &&= parsed.success
    }
    if (!valid) {
      return
    }
    setUploading(true)
    for (const item of pending) {
      update(item.key, { status: 'uploading', problem: undefined })
      try {
        const image = await uploadImage(item.file, imageMetaSchema.parse(item), progress =>
          update(item.key, { progress }),
        )
        update(item.key, { status: 'done', progress: 100 })
        onUploaded(image)
      } catch {
        update(item.key, { status: 'ready', progress: 0, problem: 'No se ha podido subir. Vuelve a probar.' })
      }
    }
    setUploading(false)
  }

  return (
    <DialogRoot open onOpenChange={() => !uploading && onClose()} size="lg" scrollBehavior="inside">
      <DialogContent>
        <DialogHeader>
          <DialogTitle fontFamily="heading" fontWeight={500} fontSize="xl">
            Subir imágenes
          </DialogTitle>
        </DialogHeader>
        <DialogBody>
          <Stack gap={6}>
            <Text>
              Ponle a cada imagen un nombre para encontrarla después y una descripción de lo que se ve, que es lo que
              leen las personas ciegas y los buscadores.
            </Text>
            {items.map(item => (
              <Flex
                key={item.key}
                as="section"
                aria-label={item.file.name}
                gap={4}
                direction={{ base: 'column', sm: 'row' }}
                borderWidth={1}
                borderRadius="md"
                p={4}
              >
                <Box
                  flexShrink={0}
                  w={{ base: 'full', sm: '140px' }}
                  aspectRatio={4 / 3}
                  bg="bg.muted"
                  borderRadius="md"
                  overflow="hidden"
                >
                  {previews[item.key] && (
                    <Image src={previews[item.key]} alt="" width="100%" height="100%" fit="contain" />
                  )}
                </Box>
                <Stack gap={3} flex={1} minW={0}>
                  <Text fontSize="sm" color="fg.muted" wordBreak="break-all">
                    {item.file.name} · {formatBytes(item.file.size)}
                  </Text>
                  {item.status === 'done' ? (
                    <Text color="green.700" fontWeight="bold" role="status">
                      Subida: {item.name}
                    </Text>
                  ) : item.status === 'error' ? null : (
                    <>
                      <Field.Root invalid={Boolean(item.nameError)} required disabled={item.status !== 'ready'}>
                        <Field.Label>Nombre</Field.Label>
                        <Input value={item.name} onChange={event => update(item.key, { name: event.target.value })} />
                        <Field.ErrorText fontSize="md">{item.nameError}</Field.ErrorText>
                      </Field.Root>
                      <Field.Root invalid={Boolean(item.altError)} disabled={item.status !== 'ready'}>
                        <Field.Label>Descripción</Field.Label>
                        <Input
                          value={item.alt}
                          onChange={event => update(item.key, { alt: event.target.value })}
                          placeholder="Por ejemplo: el estadio lleno antes del partido"
                        />
                        <Field.ErrorText fontSize="md">{item.altError}</Field.ErrorText>
                      </Field.Root>
                    </>
                  )}
                  {item.status === 'uploading' && (
                    <Progress.Root value={item.progress} colorPalette="gold" aria-label={`Subiendo ${item.name}`}>
                      <Progress.Track>
                        <Progress.Range />
                      </Progress.Track>
                    </Progress.Root>
                  )}
                  {item.problem && (
                    <Text color="red.700" role="alert">
                      {item.problem}
                    </Text>
                  )}
                  {item.status !== 'done' && item.status !== 'uploading' && (
                    <Button
                      variant="ghost"
                      colorPalette="red"
                      size="sm"
                      alignSelf="flex-start"
                      disabled={uploading}
                      onClick={() => setItems(current => current.filter(other => other.key !== item.key))}
                    >
                      Quitar de la lista
                    </Button>
                  )}
                </Stack>
              </Flex>
            ))}
            {items.length === 0 && <Text>No queda ninguna imagen por subir.</Text>}
          </Stack>
        </DialogBody>
        <DialogFooter>
          {finished || items.length === 0 ? (
            <Button colorPalette="gold" size="lg" onClick={onClose}>
              Cerrar
            </Button>
          ) : (
            <>
              <Button variant="outline" size="lg" onClick={onClose} disabled={uploading}>
                Cancelar
              </Button>
              <Button
                colorPalette="gold"
                size="lg"
                loading={uploading}
                loadingText="Subiendo…"
                disabled={pending.length === 0}
                onClick={uploadAll}
              >
                {pending.length === 1 ? 'Subir 1 imagen' : `Subir ${pending.length} imágenes`}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  )
}
