'use client'

import { Box, Button, Flex, Link, Stack, Table, Text } from '@chakra-ui/react'
import axios from 'axios'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { AdminPageHeader } from '@blog/components/admin/ui/AdminPageHeader'
import { ColumnHeader } from '@blog/components/admin/ui/ColumnHeader'
import { ConfirmDialog } from '@blog/components/admin/ui/ConfirmDialog'
import { apiErrorMessage } from '@blog/components/admin/ui/apiError'
import type { AdminWriter } from '@blog/db/queries/admin/writers'

export function WriterList({ writers }: { writers: AdminWriter[] }) {
  const router = useRouter()
  const [toDelete, setToDelete] = useState<AdminWriter | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  async function confirmDelete() {
    const writer = toDelete!
    setDeleting(true)
    try {
      await axios.delete(`/api/admin/writers/${writer.id}/`, { params: { confirm: true } })
      setMessage({ ok: true, text: `Se ha borrado la ficha de ${writer.name}.` })
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
        title="Autores"
        description="Quién firma las entradas. El nombre aparece en cada entrada de la web."
        action={
          <Button asChild colorPalette="orange" size="lg">
            <NextLink href="/admin/autores/nuevo/">Nuevo autor</NextLink>
          </Button>
        }
      />

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

      {writers.length === 0 ? (
        <Text>Todavía no hay autores.</Text>
      ) : (
        <Table.ScrollArea position="relative" borderWidth={1} borderRadius="lg" bg="white">
          <Table.Root size="lg">
            <Table.Header>
              <Table.Row>
                <ColumnHeader label="Nombre" hint="La firma que aparece en las entradas de la web." />
                <ColumnHeader label="Usuario del panel" hint="La persona que entra en este panel con esta firma." />
                <ColumnHeader label="Entradas" hint="Cuántas entradas firma." />
                <Table.ColumnHeader>
                  <Box srOnly>Acciones</Box>
                </Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {writers.map(writer => (
                <Table.Row key={writer.id}>
                  <Table.Cell>{writer.name}</Table.Cell>
                  <Table.Cell>{writer.userName ?? '—'}</Table.Cell>
                  <Table.Cell>{writer.posts}</Table.Cell>
                  <Table.Cell>
                    <Flex gap={2} justify="flex-end">
                      <Link asChild fontWeight="bold">
                        <NextLink href={`/admin/autores/${writer.id}/`} aria-label={`Editar ${writer.name}`}>
                          Editar
                        </NextLink>
                      </Link>
                      <Button
                        variant="ghost"
                        colorPalette="red"
                        size="sm"
                        onClick={() => setToDelete(writer)}
                        aria-label={`Borrar ${writer.name}`}
                      >
                        Borrar
                      </Button>
                    </Flex>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Table.ScrollArea>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title={`¿Borrar la ficha de ${toDelete?.name ?? ''}?`}
        confirmLabel="Sí, borrar"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      >
        {toDelete && toDelete.posts > 0
          ? `Firma ${toDelete.posts} ${toDelete.posts === 1 ? 'entrada' : 'entradas'}: quedarán sin autor, pero no se borran. No se puede deshacer.`
          : 'No firma ninguna entrada. No se puede deshacer.'}
      </ConfirmDialog>
    </Stack>
  )
}
