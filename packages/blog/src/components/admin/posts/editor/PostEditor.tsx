'use client'

import {
  Badge,
  Box,
  Button,
  Field,
  Flex,
  Heading,
  Input,
  Link,
  NativeSelect,
  Stack,
  Text,
  Textarea,
} from '@chakra-ui/react'
import axios from 'axios'
import { formatDistanceStrict as formatDistance } from 'date-fns'
import { es } from 'date-fns/locale'
import type { DataProp } from 'editorjs-blocks-react-renderer'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { ConfirmDialog } from '@blog/components/admin/ui/ConfirmDialog'
import { apiErrorMessage } from '@blog/components/admin/ui/apiError'
import type { LibraryImage } from '@blog/core/cloudinary/libraryImage'
import { type PostSaveInput, postSaveSchema } from '@blog/core/validation/post'
import type { EditorPost, PostFields } from '@blog/db/queries/admin/posts'
import { getReadingTime } from '@blog/utils/getReadingTime/getReadingTime'
import { seoName } from '@blog/utils/seoName/seoName'

import { ImagePickerDialog } from '../../images/ImagePickerDialog'
import { localeNames, stateLabel } from '../postState'
import { CategoriesField } from './CategoriesField'
import { ContentEditor, type ContentEditorHandle } from './ContentEditor'
import { CoverField } from './CoverField'
import { PostActions } from './PostActions'
import { WordImportButton } from './WordImportButton'
import { type AutosaveStatus, useAutosave } from './useAutosave'

type Locale = 'es' | 'en'
type Option = { id: string; name: string }

interface PostEditorProps {
  post: EditorPost
  locale: Locale
  writers: Option[]
  categories: Option[]
}

function SaveIndicator({ status, savedAt, invalid }: { status: AutosaveStatus; savedAt: string; invalid: boolean }) {
  // The current time only in the browser: the server's would not match it when hydrating.
  const [now, setNow] = useState<number | null>(null)
  useEffect(() => {
    setNow(Date.now())
    const timer = setInterval(() => setNow(Date.now()), 15_000)
    return () => clearInterval(timer)
  }, [])
  const text = invalid
    ? 'No se guarda hasta corregir lo marcado en rojo'
    : {
        saved: !now
          ? 'Guardado'
          : now - new Date(savedAt).getTime() < 10_000
            ? 'Guardado ahora mismo'
            : `Guardado hace ${formatDistance(new Date(savedAt), now, { locale: es })}`,
        pending: 'Cambios sin guardar…',
        saving: 'Guardando…',
        error: 'No se ha podido guardar. Se volverá a intentar con el próximo cambio.',
      }[status]
  return (
    <Text role="status" color={invalid || status === 'error' ? 'red.700' : 'fg.muted'}>
      {text}
    </Text>
  )
}

/**
 * One language of a post. Everything saves itself while writing; nothing reaches the site until
 * "Publicar". The page remounts it (by key) after publishing or discarding, to start from the
 * saved state again.
 */
export function PostEditor({ post, locale, writers, categories }: PostEditorProps) {
  const router = useRouter()
  const translation = post.translations[locale]!
  const published = translation.status === 'published'
  const [title, setTitle] = useState(translation.title)
  const [summary, setSummary] = useState(translation.summary)
  const [fields, setFields] = useState<PostFields>(post.fields)
  const content = useRef<DataProp>(translation.content)
  const [readingTime, setReadingTime] = useState(() => getReadingTime(translation.content))
  const editor = useRef<ContentEditorHandle>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [savedChanges, setSavedChanges] = useState(false)
  const [picker, setPicker] = useState<{ resolve: (image: LibraryImage | null) => void } | null>(null)
  const [deleting, setDeleting] = useState<'confirm' | 'busy' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const url = `/api/admin/posts/${post.id}/${locale}/`
  const autosave = useAutosave(async (input: PostSaveInput) => {
    const { data } = await axios.put<{ savedAt: string }>(url, input)
    if (published || post.live) {
      setSavedChanges(true)
    }
    return data.savedAt
  }, translation.savedAt)

  const latest = useRef({ title, summary, fields })
  latest.current = { title, summary, fields }

  function queueSave() {
    const parsed = postSaveSchema.safeParse({ ...latest.current, ...latest.current.fields, content: content.current })
    setErrors(Object.fromEntries((parsed.error?.issues ?? []).map(issue => [String(issue.path[0]), issue.message])))
    if (parsed.success) {
      autosave.schedule(parsed.data)
    }
  }

  // Saves when these differ from what was last queued: comparing values, not counting renders,
  // because development mode runs effects twice.
  const queued = useRef(JSON.stringify({ title, summary, fields }))
  useEffect(() => {
    const current = JSON.stringify({ title, summary, fields })
    if (current === queued.current) {
      return
    }
    queued.current = current
    queueSave()
  }, [title, summary, fields])

  const updateFields = (changes: Partial<PostFields>) => setFields(current => ({ ...current, ...changes }))
  const pickImage = () => new Promise<LibraryImage | null>(resolve => setPicker({ resolve }))
  async function chooseCover() {
    const image = await pickImage()
    if (image) {
      updateFields({ cover: { publicId: image.publicId, width: image.width, height: image.height, alt: image.alt } })
    }
  }

  async function deletePost() {
    setDeleting('busy')
    try {
      await axios.delete(`/api/admin/posts/${post.id}/`)
      router.push('/admin/entradas/')
      router.refresh()
    } catch (requestError) {
      setError(apiErrorMessage(requestError, 'No se ha podido borrar. Inténtalo de nuevo.'))
      setDeleting(null)
    }
  }

  async function addLanguage(missing: Locale) {
    setError(null)
    try {
      await axios.post(`/api/admin/posts/${post.id}/${missing}/`)
      router.push(`/admin/entradas/${post.id}/${missing}/`)
    } catch (requestError) {
      setError(apiErrorMessage(requestError, 'No se ha podido crear. Inténtalo de nuevo.'))
    }
  }

  const hasUnpublishedChanges = published && (translation.hasUnpublishedChanges || savedChanges)
  const state = stateLabel({ ...translation, hasUnpublishedChanges })
  const newSlug = seoName(title)
  const urlChanges = published && translation.publishedTitle !== null && seoName(translation.publishedTitle) !== newSlug

  return (
    <Stack gap={6} as="section" aria-label={`Versión en ${localeNames[locale].toLowerCase()}`}>
      <Link asChild alignSelf="flex-start" fontSize="lg">
        <NextLink href="/admin/entradas/">← Todas las entradas</NextLink>
      </Link>

      <Flex as="nav" aria-label="Idiomas" gap={2} wrap="wrap" borderBottomWidth={2}>
        {(['es', 'en'] as const).map(lng => {
          const other = post.translations[lng]
          const current = lng === locale
          if (!other) {
            return (
              <Button key={lng} variant="ghost" size="lg" onClick={() => void addLanguage(lng)}>
                + Crear la versión en {localeNames[lng].toLowerCase()}
              </Button>
            )
          }
          return (
            <Link
              key={lng}
              asChild
              px={4}
              py={3}
              fontSize="lg"
              fontWeight={current ? 'bold' : 'normal'}
              borderBottomWidth={current ? 4 : 0}
              borderColor="orange.500"
              mb="-2px"
              textDecoration="none"
              aria-current={current ? 'page' : undefined}
            >
              <NextLink href={`/admin/entradas/${post.id}/${lng}/`}>
                {localeNames[lng]}
                <Badge ms={2} colorPalette={(current ? state : stateLabel(other)).palette}>
                  {(current ? state : stateLabel(other)).label}
                </Badge>
              </NextLink>
            </Link>
          )
        })}
      </Flex>

      {/* Stays in view while writing a long post, so the save state and "Publicar" are always at hand.
          Only from tablets up: on a phone it would cover most of the screen. */}
      <Stack
        gap={4}
        bg="white"
        borderWidth={1}
        borderRadius="lg"
        p={{ base: 4, md: 6 }}
        position={{ base: 'static', md: 'sticky' }}
        top={0}
        zIndex="sticky"
        boxShadow="sm"
      >
        <Flex justify="space-between" align="baseline" gap={3} wrap="wrap">
          <Stack gap={1}>
            <Heading as="h1" size="2xl" fontFamily="Roboto">
              {title || 'Entrada sin título'}
            </Heading>
            {readingTime > 0 && <Text color="fg.muted">{`${readingTime} min de lectura`}</Text>}
          </Stack>
          <SaveIndicator status={autosave.status} savedAt={autosave.savedAt} invalid={Object.keys(errors).length > 0} />
        </Flex>
        <PostActions
          postId={post.id}
          translation={translation}
          hasUnpublishedChanges={hasUnpublishedChanges}
          flush={autosave.flush}
        />
        {published && hasUnpublishedChanges && (
          <Text color="fg.muted">Los lectores siguen viendo la versión publicada hasta que publiques los cambios.</Text>
        )}
        {error && (
          <Box role="alert" bg="red.50" color="red.900" p={3} borderRadius="md">
            {error}
          </Box>
        )}
      </Stack>

      <Stack gap={6} bg="white" borderWidth={1} borderRadius="lg" p={{ base: 4, md: 6 }}>
        <Field.Root invalid={Boolean(errors.title)}>
          <Field.Label fontSize="lg">Título</Field.Label>
          <Input value={title} onChange={event => setTitle(event.target.value)} size="lg" fontSize="xl" />
          {urlChanges ? (
            <Field.HelperText fontSize="md" color="orange.800">
              Al publicar, la dirección de la entrada cambiará a …/post/{translation.number}/{newSlug}/. La antigua
              seguirá funcionando.
            </Field.HelperText>
          ) : (
            <Field.HelperText fontSize="md">Obligatorio para publicar.</Field.HelperText>
          )}
          <Field.ErrorText fontSize="md">{errors.title}</Field.ErrorText>
        </Field.Root>
        <Field.Root invalid={Boolean(errors.summary)}>
          <Field.Label fontSize="lg">Resumen</Field.Label>
          <Textarea value={summary} onChange={event => setSummary(event.target.value)} rows={3} size="lg" />
          <Field.HelperText fontSize="md">
            Dos o tres frases. Se ve en las portadas de la web y al compartir la entrada. Obligatorio para publicar.
          </Field.HelperText>
          <Field.ErrorText fontSize="md">{errors.summary}</Field.ErrorText>
        </Field.Root>
      </Stack>

      <Stack gap={6} bg="white" borderWidth={1} borderRadius="lg" p={{ base: 4, md: 6 }}>
        <CoverField
          cover={fields.cover}
          onChoose={() => void chooseCover()}
          onChange={cover => updateFields({ cover })}
        />
        <Flex gap={4} direction={{ base: 'column', md: 'row' }}>
          <Field.Root invalid={Boolean(errors.coverImageAuthor)}>
            <Field.Label>Autor de la foto de portada</Field.Label>
            <Input
              value={fields.coverImageAuthor}
              onChange={event => updateFields({ coverImageAuthor: event.target.value })}
            />
            <Field.ErrorText>{errors.coverImageAuthor}</Field.ErrorText>
          </Field.Root>
          <Field.Root invalid={Boolean(errors.coverImageSourceUrl)}>
            <Field.Label>Enlace a la foto original</Field.Label>
            <Input
              type="url"
              value={fields.coverImageSourceUrl}
              onChange={event => updateFields({ coverImageSourceUrl: event.target.value })}
              placeholder="https://"
            />
            <Field.ErrorText>{errors.coverImageSourceUrl}</Field.ErrorText>
          </Field.Root>
        </Flex>
        <Field.Root>
          <Field.Label fontSize="lg">Firma</Field.Label>
          <NativeSelect.Root maxW="sm">
            <NativeSelect.Field
              value={fields.writerId}
              onChange={event => updateFields({ writerId: event.target.value })}
            >
              <option value="">Sin firma</option>
              {writers.map(writer => (
                <option key={writer.id} value={writer.id}>
                  {writer.name}
                </option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Field.Root>
        <CategoriesField
          options={categories}
          value={fields.categoryIds}
          onChange={categoryIds => updateFields({ categoryIds })}
        />
        {post.live && (
          <Text color="fg.muted">
            La portada, la firma y las categorías son las mismas en los dos idiomas. Sus cambios también esperan a que
            publiques.
          </Text>
        )}
      </Stack>

      <Stack gap={3}>
        <Heading as="h2" size="lg" fontFamily="Roboto">
          Texto
        </Heading>
        <WordImportButton onImport={blocks => editor.current!.append(blocks)} />
        <ContentEditor
          ref={editor}
          initialContent={translation.content}
          pickImage={pickImage}
          onChange={value => {
            content.current = value
            setReadingTime(getReadingTime(value))
            queueSave()
          }}
        />
        {errors.content && (
          <Text role="alert" color="red.700">
            {errors.content}
          </Text>
        )}
      </Stack>

      <Flex justify="flex-end" pt={6} borderTopWidth={1}>
        <Button variant="outline" colorPalette="red" onClick={() => setDeleting('confirm')}>
          Borrar la entrada
        </Button>
      </Flex>

      <ImagePickerDialog
        open={Boolean(picker)}
        onSelect={image => {
          picker?.resolve(image)
          setPicker(null)
        }}
        onClose={() => {
          picker?.resolve(null)
          setPicker(null)
        }}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        title="¿Borrar la entrada?"
        confirmLabel="Sí, borrar"
        loading={deleting === 'busy'}
        onConfirm={() => void deletePost()}
        onCancel={() => setDeleting(null)}
      >
        Se borra en los dos idiomas y deja de verse en la web.
      </ConfirmDialog>
    </Stack>
  )
}
