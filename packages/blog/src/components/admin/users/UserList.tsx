'use client'

import { Badge, Box, Button, Link, Stack, Table, Text } from '@chakra-ui/react'
import NextLink from 'next/link'

import { AdminPageHeader } from '@blog/components/admin/ui/AdminPageHeader'
import { ColumnHeader } from '@blog/components/admin/ui/ColumnHeader'
import type { AdminUser } from '@blog/db/queries/admin/users'

export function UserList({ users }: { users: AdminUser[] }) {
  return (
    <Stack gap={6}>
      <AdminPageHeader
        title="Usuarios"
        description="Quién puede entrar en este panel. Todos pueden hacer de todo."
        action={
          <Button asChild colorPalette="gold" size="lg">
            <NextLink href="/admin/usuarios/nuevo/">Nuevo usuario</NextLink>
          </Button>
        }
      />
      <Table.ScrollArea position="relative" borderWidth={1} borderRadius="lg" bg="bg.panel">
        <Table.Root size="lg">
          <Table.Header>
            <Table.Row>
              <ColumnHeader label="Nombre" hint="Cómo se llama la persona. Aparece arriba del panel al entrar." />
              <ColumnHeader label="Email" hint="Con el que entra en el panel y al que llegan los avisos." />
              <ColumnHeader
                label="Estado"
                hint="«Activo» puede entrar. «Desactivado» ya no puede, pero no se borra nada de lo que hizo."
              />
              <ColumnHeader label="Firma" hint="La ficha de autor que tiene, si firma entradas." />
              <Table.ColumnHeader>
                <Box srOnly>Acciones</Box>
              </Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {users.map(user => (
              <Table.Row key={user.id}>
                <Table.Cell>{user.name}</Table.Cell>
                <Table.Cell>{user.email}</Table.Cell>
                <Table.Cell>
                  {user.active ? (
                    <Badge colorPalette="green" size="lg">
                      Activo
                    </Badge>
                  ) : (
                    <Badge colorPalette="gray" size="lg">
                      Desactivado
                    </Badge>
                  )}
                </Table.Cell>
                <Table.Cell>{user.writerName ?? <Text color="fg.muted">—</Text>}</Table.Cell>
                <Table.Cell textAlign="right">
                  <Link asChild fontWeight="bold">
                    <NextLink href={`/admin/usuarios/${user.id}/`} aria-label={`Editar a ${user.name}`}>
                      Editar
                    </NextLink>
                  </Link>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>
    </Stack>
  )
}
