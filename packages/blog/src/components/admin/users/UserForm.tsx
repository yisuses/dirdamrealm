'use client'

import { Box, Button, Checkbox, Field, Input, Stack, Text } from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Controller, type Resolver, useForm } from 'react-hook-form'

import { AdminPageHeader } from '@blog/components/admin/ui/AdminPageHeader'
import { PasswordInput } from '@blog/components/admin/ui/PasswordInput'
import { apiErrorMessage } from '@blog/components/admin/ui/apiError'
import { type UserUpdateInput, userCreateSchema, userUpdateSchema } from '@blog/core/validation/user'
import type { AdminUser } from '@blog/db/queries/admin/users'

interface UserFormProps {
  user?: AdminUser
  /** The signed-in user, who cannot deactivate themselves. */
  currentUserId: string
}

export function UserForm({ user, currentUserId }: UserFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const isSelf = user?.id === currentUserId
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserUpdateInput>({
    // Creating needs a password; editing keeps the current one when left empty.
    resolver: zodResolver(user ? userUpdateSchema : userCreateSchema) as unknown as Resolver<UserUpdateInput>,
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      active: user?.active ?? true,
      password: '',
      passwordConfirm: '',
    },
  })

  async function onSubmit(values: UserUpdateInput) {
    setError(null)
    try {
      if (user) {
        await axios.put(`/api/admin/users/${user.id}/`, values)
      } else {
        await axios.post('/api/admin/users/', values)
      }
      router.push('/admin/usuarios/')
      router.refresh()
    } catch (requestError) {
      setError(apiErrorMessage(requestError))
    }
  }

  return (
    <Stack gap={8} as="section">
      <AdminPageHeader title={user ? `Editar a ${user.name}` : 'Nuevo usuario'} />

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack gap={6} bg="bg.panel" borderWidth={1} borderRadius="lg" p={{ base: 4, md: 8 }}>
          <Field.Root invalid={Boolean(errors.name)} required>
            <Field.Label fontSize="lg">Nombre</Field.Label>
            <Input {...register('name')} size="lg" fontSize="lg" autoComplete="off" />
            <Field.ErrorText fontSize="md">{errors.name?.message}</Field.ErrorText>
          </Field.Root>
          <Field.Root invalid={Boolean(errors.email)} required>
            <Field.Label fontSize="lg">Email</Field.Label>
            <Input {...register('email')} type="email" size="lg" fontSize="lg" autoComplete="off" />
            <Field.HelperText fontSize="md">Con el que entrará en el panel.</Field.HelperText>
            <Field.ErrorText fontSize="md">{errors.email?.message}</Field.ErrorText>
          </Field.Root>

          {user && (
            <Controller
              control={control}
              name="active"
              render={({ field }) => (
                <Stack gap={1}>
                  <Checkbox.Root
                    checked={field.value}
                    onCheckedChange={({ checked }) => field.onChange(checked === true)}
                    disabled={isSelf}
                    size="lg"
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control />
                    <Checkbox.Label fontSize="lg">Puede entrar en el panel (activo)</Checkbox.Label>
                  </Checkbox.Root>
                  {isSelf && (
                    <Text fontSize="md" color="fg.muted">
                      No puedes desactivar tu propio usuario.
                    </Text>
                  )}
                </Stack>
              )}
            />
          )}

          <Field.Root invalid={Boolean(errors.password)} required={!user}>
            <Field.Label fontSize="lg">{user ? 'Contraseña nueva' : 'Contraseña'}</Field.Label>
            <PasswordInput {...register('password')} autoComplete="new-password" />
            {!errors.password && (
              <Field.HelperText fontSize="md">
                {user ? 'Déjala vacía para no cambiarla. ' : ''}Al menos 10 caracteres.
              </Field.HelperText>
            )}
            <Field.ErrorText fontSize="md">{errors.password?.message}</Field.ErrorText>
          </Field.Root>
          <Field.Root invalid={Boolean(errors.passwordConfirm)} required={!user}>
            <Field.Label fontSize="lg">Repite la contraseña</Field.Label>
            <PasswordInput {...register('passwordConfirm')} autoComplete="new-password" />
            <Field.ErrorText fontSize="md">{errors.passwordConfirm?.message}</Field.ErrorText>
          </Field.Root>

          {error && (
            <Box role="alert" bg="red.50" color="red.900" p={4} borderRadius="md">
              {error}
            </Box>
          )}

          <Stack direction={{ base: 'column', sm: 'row' }} gap={4}>
            <Button type="submit" colorPalette="gold" size="lg" loading={isSubmitting} loadingText="Guardando…">
              Guardar
            </Button>
            <Button asChild variant="outline" size="lg">
              <NextLink href="/admin/usuarios/">Cancelar</NextLink>
            </Button>
          </Stack>
        </Stack>
      </form>
    </Stack>
  )
}
