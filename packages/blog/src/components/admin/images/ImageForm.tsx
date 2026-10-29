'use client'

import { Box, Button, Field, Grid, Heading, Image, Input, Link, List, Stack, Text, Textarea } from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { AdminPageHeader } from '@blog/components/admin/ui/AdminPageHeader'
import { ConfirmDialog } from '@blog/components/admin/ui/ConfirmDialog'
import { apiErrorMessage } from '@blog/components/admin/ui/apiError'
import type { LibraryImage } from '@blog/core/cloudinary/libraryImage'
import { type ImageMetaInput, imageMetaSchema } from '@blog/core/validation/image'
import type { ImageUsage } from '@blog/db/queries/admin/images'

import { formatBytes, originalUrl, previewUrl, removeFromLibrary, replaceInLibrary } from './images'

const statusLabels = { draft: 'borrador', published: 'publicada', archived: 'archivada' }

function UsageItem({ usage }: { usage: ImageUsage }) {
  const where = [usage.cover && 'portada', usage.content && 'texto'].filter(Boolean).join(' y ')
  const path = `${usage.locale === 'en' ? '/en' : ''}/post/${usage.number}/`
  return (
    <List.Item>
      {usage.status === 'published' ? (
        <Link asChild color="gold.600" textDecoration="underline">
          <NextLink href={path} target="_blank">
            {usage.title}
          </NextLink>
        </Link>
      ) : (
        usage.title
      )}{' '}
      <Text as="span" color="fg.muted">
        ({usage.locale === 'en' ? 'inglés' : 'español'}, {statusLabels[usage.status]}, en la {where})
      </Text>
    </List.Item>
  )
}

export function ImageForm({ image, usage }: { image: LibraryImage; usage: ImageUsage[] }) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ImageMetaInput>({
    resolver: zodResolver(imageMetaSchema),
    defaultValues: { name: image.name, alt: image.alt },
  })

  async function onSubmit(values: ImageMetaInput) {
    setStatus(null)
    try {
      const { data } = await axios.patch<LibraryImage>(`/api/admin/images/${image.publicId}/`, values)
      replaceInLibrary(queryClient, data)
      setStatus({ ok: true, text: 'Guardado.' })
      router.refresh()
    } catch (error) {
      setStatus({ ok: false, text: apiErrorMessage(error) })
    }
  }

  async function confirmDelete() {
    setDeleting(true)
    try {
      await axios.delete(`/api/admin/images/${image.publicId}/`)
      removeFromLibrary(queryClient, image.publicId)
      router.push('/admin/imagenes/')
    } catch (error) {
      setStatus({ ok: false, text: apiErrorMessage(error, 'No se ha podido borrar. Inténtalo de nuevo.') })
      setDeleting(false)
      setConfirming(false)
    }
  }

  const details = [
    ['Tamaño', `${image.width} × ${image.height} píxeles`],
    ['Peso', formatBytes(image.bytes)],
    ['Formato', image.format.toUpperCase()],
    [
      'Subida el',
      new Date(image.createdAt).toLocaleDateString('es-ES', { dateStyle: 'long', timeZone: 'Europe/Madrid' }),
    ],
  ]

  return (
    <Stack gap={8} as="section">
      <Stack gap={3}>
        <Link asChild alignSelf="flex-start" fontSize="lg">
          <NextLink href="/admin/imagenes/">← Volver a las imágenes</NextLink>
        </Link>
        <AdminPageHeader title={image.name} />
      </Stack>

      <Grid templateColumns={{ base: '1fr', lg: 'minmax(0, 3fr) minmax(0, 2fr)' }} gap={8} alignItems="start">
        <Stack gap={3}>
          <Box bg="bg.muted" borderRadius="lg" overflow="hidden" borderWidth={1}>
            <Image
              src={previewUrl(image.publicId)}
              alt={image.alt}
              aspectRatio={image.width / image.height}
              width="100%"
              maxH="70vh"
              fit="contain"
            />
          </Box>
          <Link href={originalUrl(image.publicId)} target="_blank" alignSelf="flex-start" textDecoration="underline">
            Ver la imagen a tamaño completo
          </Link>
        </Stack>

        <Stack gap={6}>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack gap={6} bg="bg.panel" borderWidth={1} borderRadius="lg" p={{ base: 4, md: 6 }}>
              <Field.Root invalid={Boolean(errors.name)} required>
                <Field.Label fontSize="lg">Nombre</Field.Label>
                <Input {...register('name')} size="lg" fontSize="lg" />
                <Field.HelperText fontSize="md">Para encontrarla en el buscador de imágenes.</Field.HelperText>
                <Field.ErrorText fontSize="md">{errors.name?.message}</Field.ErrorText>
              </Field.Root>
              <Field.Root invalid={Boolean(errors.alt)}>
                <Field.Label fontSize="lg">Descripción</Field.Label>
                <Textarea {...register('alt')} size="lg" fontSize="lg" rows={3} />
                <Field.HelperText fontSize="md">
                  Lo que se ve en la imagen, para las personas ciegas y los buscadores. Las entradas que ya la usan
                  guardan su propia descripción.
                </Field.HelperText>
                <Field.ErrorText fontSize="md">{errors.alt?.message}</Field.ErrorText>
              </Field.Root>
              {status && (
                <Box
                  role="status"
                  bg={status.ok ? 'green.50' : 'red.50'}
                  color={status.ok ? 'green.900' : 'red.900'}
                  p={4}
                  borderRadius="md"
                >
                  {status.text}
                </Box>
              )}
              <Button
                type="submit"
                colorPalette="gold"
                size="lg"
                alignSelf="flex-start"
                loading={isSubmitting}
                loadingText="Guardando…"
              >
                Guardar
              </Button>
            </Stack>
          </form>

          <Stack as="dl" gap={2} bg="bg.panel" borderWidth={1} borderRadius="lg" p={{ base: 4, md: 6 }}>
            {details.map(([label, value]) => (
              <Grid key={label} templateColumns="8rem 1fr" gap={2}>
                <Text as="dt" fontWeight="bold">
                  {label}
                </Text>
                <Text as="dd">{value}</Text>
              </Grid>
            ))}
          </Stack>

          <Stack gap={3} bg="bg.panel" borderWidth={1} borderRadius="lg" p={{ base: 4, md: 6 }}>
            <Heading as="h2" size="lg" fontFamily="heading" fontWeight={500}>
              Dónde se usa
            </Heading>
            {usage.length === 0 ? (
              <>
                <Text>En ninguna entrada.</Text>
                <Button
                  variant="outline"
                  colorPalette="red"
                  size="lg"
                  alignSelf="flex-start"
                  onClick={() => setConfirming(true)}
                >
                  Borrar la imagen
                </Button>
              </>
            ) : (
              <>
                <List.Root gap={2} ps={5}>
                  {usage.map(item => (
                    <UsageItem key={item.number} usage={item} />
                  ))}
                </List.Root>
                <Text color="fg.muted">
                  Para borrarla, quítala antes de {usage.length === 1 ? 'esa entrada' : 'esas entradas'}.
                </Text>
              </>
            )}
          </Stack>
        </Stack>
      </Grid>

      <ConfirmDialog
        open={confirming}
        title={`¿Borrar «${image.name}»?`}
        confirmLabel="Sí, borrar"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setConfirming(false)}
      >
        Desaparecerá de Cloudinary. No se puede deshacer.
      </ConfirmDialog>
    </Stack>
  )
}
