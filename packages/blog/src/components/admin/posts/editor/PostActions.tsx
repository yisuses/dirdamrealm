'use client'

import { Box, Button, Field, Flex, Input, Stack, Text } from '@chakra-ui/react'
import axios from 'axios'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

import { ConfirmDialog } from '@blog/components/admin/ui/ConfirmDialog'
import { apiErrorMessage } from '@blog/components/admin/ui/apiError'
import {
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from '@blog/components/ui/dialog'
import type { PostAction } from '@blog/core/validation/post'
import type { EditorTranslation } from '@blog/db/queries/admin/posts'

import { formatDay, localeNames, previewPath, publicPostPath } from '../postState'

interface PostActionsProps {
  postId: string
  translation: EditorTranslation
  hasUnpublishedChanges: boolean
  /** Saves what is still waiting; false when it could not. */
  flush: () => Promise<boolean>
}

type Confirmable = 'publish' | 'unpublish' | 'discard'

const tomorrow = () => {
  const day = new Date()
  day.setDate(day.getDate() + 1)
  return day.toLocaleDateString('en-CA')
}

/** Publish, schedule, preview, discard or unpublish this language, each saying what it does. */
export function PostActions({ postId, translation, hasUnpublishedChanges, flush }: PostActionsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [confirming, setConfirming] = useState<Confirmable | null>(null)
  const [scheduling, setScheduling] = useState(false)
  const [day, setDay] = useState(translation.scheduledFor ?? tomorrow())
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { locale, number, status, scheduledFor } = translation
  const published = status === 'published'
  const language = localeNames[locale].toLowerCase()

  async function run(action: PostAction) {
    setBusy(true)
    setError(null)
    try {
      if (!(await flush())) {
        setError('No se han podido guardar los últimos cambios. Revisa la conexión y vuelve a probar.')
        return
      }
      await axios.patch(`/api/admin/posts/${postId}/${locale}/`, action)
      // A new version in the address remounts the editor with what the server now has.
      router.replace(`${pathname}?v=${Date.now()}`)
    } catch (requestError) {
      setError(apiErrorMessage(requestError, 'No se ha podido hacer. Inténtalo de nuevo.'))
    } finally {
      setBusy(false)
      setConfirming(null)
      setScheduling(false)
    }
  }

  // Opened now, while the click still counts as the user's: browsers block windows opened later.
  async function preview() {
    const tab = window.open('', '_blank')
    await flush()
    if (tab) {
      tab.location.href = previewPath(locale, number, translation.previewToken)
    }
  }

  const confirmations: Record<Confirmable, { title: string; body: string; label: string; palette: 'red' | 'orange' }> =
    {
      publish: published
        ? {
            title: '¿Publicar los cambios?',
            body: `Los lectores verán la versión en ${language} tal y como está ahora, en unos segundos.`,
            label: 'Sí, publicar los cambios',
            palette: 'orange',
          }
        : {
            title: `¿Publicar la versión en ${language}?`,
            body: 'Se verá en la web en unos segundos, con la fecha de hoy.',
            label: 'Sí, publicar',
            palette: 'orange',
          },
      unpublish: {
        title: `¿Despublicar la versión en ${language}?`,
        body: 'Dejará de verse en la web, pero no se borra: podrás volver a publicarla cuando quieras.',
        label: 'Sí, despublicar',
        palette: 'red',
      },
      discard: {
        title: '¿Descartar los cambios?',
        body: 'Volverá a quedar como se ve ahora en la web. Los cambios descartados no se pueden recuperar.',
        label: 'Sí, descartar',
        palette: 'red',
      },
    }
  const current = confirming && confirmations[confirming]

  return (
    <Stack gap={3}>
      <Flex gap={3} wrap="wrap">
        {(!published || hasUnpublishedChanges) && (
          <Button colorPalette="orange" size="lg" onClick={() => setConfirming('publish')} disabled={busy}>
            {published ? 'Publicar los cambios' : 'Publicar'}
          </Button>
        )}
        {!published && (
          <Button variant="outline" size="lg" bg="white" onClick={() => setScheduling(true)} disabled={busy}>
            {scheduledFor ? 'Cambiar el día' : 'Programar'}
          </Button>
        )}
        {(!published || hasUnpublishedChanges) && (
          <Button variant="outline" size="lg" bg="white" onClick={() => void preview()}>
            Vista previa
          </Button>
        )}
        {published && (
          <Button asChild variant="outline" size="lg" bg="white">
            <a href={publicPostPath(locale, number)} target="_blank" rel="noreferrer">
              Ver en la web
            </a>
          </Button>
        )}
        {hasUnpublishedChanges && (
          <Button variant="ghost" size="lg" onClick={() => setConfirming('discard')} disabled={busy}>
            Descartar los cambios
          </Button>
        )}
        {published && (
          <Button
            variant="ghost"
            colorPalette="red"
            size="lg"
            onClick={() => setConfirming('unpublish')}
            disabled={busy}
          >
            Despublicar
          </Button>
        )}
      </Flex>

      {scheduledFor && !published && (
        <Flex gap={3} align="center" wrap="wrap">
          <Text>
            Se publicará sola el <b>{formatDay(scheduledFor)}</b> por la mañana.
          </Text>
          <Button
            variant="plain"
            textDecoration="underline"
            p={0}
            h="auto"
            onClick={() => void run({ action: 'schedule', date: null })}
          >
            No programar
          </Button>
        </Flex>
      )}

      {error && (
        <Box role="alert" bg="red.50" color="red.900" p={3} borderRadius="md">
          {error}
        </Box>
      )}

      <ConfirmDialog
        open={Boolean(current)}
        title={current?.title ?? ''}
        confirmLabel={current?.label ?? ''}
        confirmPalette={current?.palette}
        loading={busy}
        onConfirm={() => void run({ action: confirming! })}
        onCancel={() => setConfirming(null)}
      >
        {current?.body}
      </ConfirmDialog>

      <DialogRoot open={scheduling} onOpenChange={({ open }) => !open && setScheduling(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle fontFamily="Roboto" fontSize="xl">
              Programar la publicación
            </DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Stack gap={4}>
              <Text>
                Elige el día: la entrada se publicará sola esa mañana, hacia las 8. Hasta entonces puedes seguir
                cambiándola.
              </Text>
              <Field.Root>
                <Field.Label>Día</Field.Label>
                <Input
                  type="date"
                  min={tomorrow()}
                  value={day}
                  onChange={event => setDay(event.target.value)}
                  size="lg"
                />
              </Field.Root>
            </Stack>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" size="lg" onClick={() => setScheduling(false)}>
              Cancelar
            </Button>
            <Button
              colorPalette="orange"
              size="lg"
              loading={busy}
              disabled={!day}
              onClick={() => void run({ action: 'schedule', date: day })}
            >
              Programar
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </Stack>
  )
}
