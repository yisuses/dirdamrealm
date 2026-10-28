'use client'

import { Box, Button, Flex, Input, Link, Stack, Table, Text } from '@chakra-ui/react'
import axios from 'axios'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { AdminPageHeader } from '@blog/components/admin/ui/AdminPageHeader'
import { ColumnHeader } from '@blog/components/admin/ui/ColumnHeader'
import { ConfirmDialog } from '@blog/components/admin/ui/ConfirmDialog'
import { apiErrorMessage } from '@blog/components/admin/ui/apiError'
import { commentListPageSize } from '@blog/core/validation/comment'
import type { AdminComment } from '@blog/db/queries/admin/comments'

import { publicPostPath } from '../posts/postState'

interface CommentListProps {
  comments: AdminComment[]
  total: number
  query: string
  page: number
}

function pageHref(query: string, page: number) {
  const params = new URLSearchParams()
  if (query) params.set('q', query)
  if (page > 1) params.set('pagina', String(page))
  const search = params.toString()
  return `/admin/comentarios/${search ? `?${search}` : ''}`
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Madrid' })

/** Visitors' comments, newest first, to read and delete the ones that should not be on the site. */
export function CommentList({ comments, total, query, page }: CommentListProps) {
  const router = useRouter()
  const [toDelete, setToDelete] = useState<AdminComment | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)
  const pages = Math.max(1, Math.ceil(total / commentListPageSize))

  async function confirmDelete() {
    const comment = toDelete!
    setDeleting(true)
    try {
      await axios.delete(`/api/admin/comments/${comment.id}/`)
      setMessage({ ok: true, text: `Se ha borrado el comentario de ${comment.author.trim()}.` })
      router.refresh()
    } catch (error) {
      setMessage({ ok: false, text: apiErrorMessage(error, 'No se ha podido borrar. Inténtalo de nuevo.') })
    } finally {
      setDeleting(false)
      setToDelete(null)
    }
  }

  return (
    <Stack gap={6}>
      <AdminPageHeader
        title="Comentarios"
        description="Lo que escriben los lectores en las entradas, lo más nuevo primero. Se publican solos; aquí puedes borrar los que no deban estar."
      />

      <Flex asChild gap={3} wrap="wrap">
        <form role="search" method="get" action="/admin/comentarios/">
          <Input
            name="q"
            type="search"
            defaultValue={query}
            placeholder="Buscar por autor o texto"
            aria-label="Buscar comentarios por autor o texto"
            size="lg"
            bg="white"
            maxW={{ md: 'sm' }}
          />
          <Button type="submit" size="lg" variant="outline" bg="white">
            Buscar
          </Button>
          {query && (
            <Button asChild size="lg" variant="ghost">
              <NextLink href="/admin/comentarios/">Ver todos</NextLink>
            </Button>
          )}
        </form>
      </Flex>

      {message && (
        <Box
          role="status"
          bg={message.ok ? 'green.50' : 'red.50'}
          color={message.ok ? 'green.900' : 'red.900'}
          p={4}
          borderRadius="md"
        >
          {message.text}
        </Box>
      )}

      <Text color="fg.muted">{total === 1 ? '1 comentario' : `${total} comentarios`}</Text>

      {comments.length === 0 ? (
        <Text fontSize="lg">
          {query ? 'Ningún comentario coincide con la búsqueda.' : 'Todavía no hay comentarios.'}
        </Text>
      ) : (
        <Table.ScrollArea position="relative" borderWidth={1} borderRadius="lg" bg="white">
          <Table.Root size="lg">
            <Table.Header>
              <Table.Row>
                <ColumnHeader label="Comentario" hint="Quién lo escribió y qué dijo." />
                <ColumnHeader label="Entrada" hint="Dónde lo escribió. Pulsa para verlo en la web." />
                <ColumnHeader label="Fecha" hint="Cuándo lo escribió." />
                <Table.ColumnHeader>
                  <Box srOnly>Acciones</Box>
                </Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {comments.map(comment => (
                <Table.Row key={comment.id} verticalAlign="top">
                  <Table.Cell minW="xs" maxW="lg">
                    <Text fontWeight="bold">{comment.author}</Text>
                    <Text lineClamp={4} whiteSpace="pre-line">
                      {comment.text}
                    </Text>
                  </Table.Cell>
                  <Table.Cell minW="3xs" maxW="2xs">
                    {comment.post.published ? (
                      <Link
                        href={`${publicPostPath(comment.post.locale, comment.post.number)}#comment-${comment.id}`}
                        target="_blank"
                        rel="noreferrer"
                        textDecoration="underline"
                      >
                        {comment.post.title}
                      </Link>
                    ) : (
                      <Text>{comment.post.title} (no publicada)</Text>
                    )}
                  </Table.Cell>
                  <Table.Cell whiteSpace="nowrap">{formatDate(comment.createdAt)}</Table.Cell>
                  <Table.Cell>
                    <Button
                      variant="ghost"
                      colorPalette="red"
                      size="sm"
                      onClick={() => setToDelete(comment)}
                      aria-label={`Borrar el comentario de ${comment.author.trim()}`}
                    >
                      Borrar
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Table.ScrollArea>
      )}

      {pages > 1 && (
        <Flex as="nav" aria-label="Páginas" gap={3} align="center" justify="center">
          {page > 1 && (
            <Button asChild variant="outline" bg="white">
              <NextLink href={pageHref(query, page - 1)}>← Más nuevos</NextLink>
            </Button>
          )}
          <Text>
            Página {page} de {pages}
          </Text>
          {page < pages && (
            <Button asChild variant="outline" bg="white">
              <NextLink href={pageHref(query, page + 1)}>Más antiguos →</NextLink>
            </Button>
          )}
        </Flex>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title={`¿Borrar el comentario de ${toDelete?.author.trim() ?? ''}?`}
        confirmLabel="Sí, borrar"
        loading={deleting}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setToDelete(null)}
      >
        Dejará de verse en la entrada. No se puede deshacer.
      </ConfirmDialog>
    </Stack>
  )
}
