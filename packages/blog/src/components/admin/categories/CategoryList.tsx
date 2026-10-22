'use client'

import { Badge, Box, Button, Flex, Link, Stack, Table, Text } from '@chakra-ui/react'
import axios from 'axios'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { AdminPageHeader } from '@blog/components/admin/ui/AdminPageHeader'
import { ConfirmDialog } from '@blog/components/admin/ui/ConfirmDialog'
import { apiErrorMessage } from '@blog/components/admin/ui/apiError'
import type { AdminCategory } from '@blog/db/queries/admin/categories'

export function CategoryList({ categories }: { categories: AdminCategory[] }) {
  const router = useRouter()
  const [toDelete, setToDelete] = useState<AdminCategory | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  async function confirmDelete() {
    const category = toDelete!
    setDeleting(true)
    try {
      await axios.delete(`/api/admin/categories/${category.id}/`, { params: { confirm: true } })
      setMessage({ ok: true, text: `Se ha borrado la categoría «${category.es.name}».` })
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
        title="Categorías"
        description="Las que están en el menú principal aparecen arriba en la web."
        action={
          <Button asChild colorPalette="orange" size="lg">
            <NextLink href="/admin/categorias/nueva/">Nueva categoría</NextLink>
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

      {categories.length === 0 ? (
        <Text>Todavía no hay categorías.</Text>
      ) : (
        <Table.ScrollArea borderWidth={1} borderRadius="lg" bg="white">
          <Table.Root size="lg">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Nombre</Table.ColumnHeader>
                <Table.ColumnHeader>En inglés</Table.ColumnHeader>
                <Table.ColumnHeader>Código</Table.ColumnHeader>
                <Table.ColumnHeader>Entradas</Table.ColumnHeader>
                <Table.ColumnHeader>
                  <Box srOnly>Acciones</Box>
                </Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {categories.map(category => (
                <Table.Row key={category.id}>
                  <Table.Cell>
                    <Flex gap={2} align="center" wrap="wrap">
                      {category.es.name}
                      {category.main && <Badge colorPalette="orange">Menú principal</Badge>}
                    </Flex>
                  </Table.Cell>
                  <Table.Cell>{category.en.name}</Table.Cell>
                  <Table.Cell fontFamily="mono">{category.code}</Table.Cell>
                  <Table.Cell>{category.posts}</Table.Cell>
                  <Table.Cell>
                    <Flex gap={2} justify="flex-end">
                      <Link asChild fontWeight="bold">
                        <NextLink href={`/admin/categorias/${category.id}/`} aria-label={`Editar ${category.es.name}`}>
                          Editar
                        </NextLink>
                      </Link>
                      <Button
                        variant="ghost"
                        colorPalette="red"
                        size="sm"
                        onClick={() => setToDelete(category)}
                        aria-label={`Borrar ${category.es.name}`}
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
        title={`¿Borrar «${toDelete?.es.name ?? ''}»?`}
        confirmLabel="Sí, borrar"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      >
        {toDelete && toDelete.posts > 0
          ? `Está en ${toDelete.posts} ${toDelete.posts === 1 ? 'entrada' : 'entradas'}: se quitará de ellas, pero las entradas no se borran. No se puede deshacer.`
          : 'No está en ninguna entrada. No se puede deshacer.'}
      </ConfirmDialog>
    </Stack>
  )
}
