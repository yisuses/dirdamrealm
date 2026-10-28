'use client'

import { Box, Button, Field, Stack, Text } from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import NextLink from 'next/link'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { PasswordInput } from '@blog/components/admin/ui/PasswordInput'
import { apiErrorMessage } from '@blog/components/admin/ui/apiError'
import { passwordResetSchema } from '@blog/core/validation/user'

import { AuthCard } from './AuthCard'

type Values = z.infer<typeof passwordResetSchema>

export function ResetPasswordForm({ token }: { token?: string }) {
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(passwordResetSchema), defaultValues: { token: token ?? '' } })

  async function onSubmit(values: Values) {
    setError(null)
    try {
      await axios.post('/api/password-reset/confirm/', values)
      setDone(true)
    } catch (requestError) {
      setError(apiErrorMessage(requestError, 'No se ha podido cambiar. Inténtalo de nuevo.'))
    }
  }

  if (!token) {
    return (
      <AuthCard title="Nueva contraseña">
        <Text fontSize="lg">Este enlace no está completo. Pide uno nuevo.</Text>
        <Button asChild size="lg" colorPalette="orange">
          <NextLink href="/admin/recuperar-contrasena/">Pedir un enlace nuevo</NextLink>
        </Button>
      </AuthCard>
    )
  }

  return (
    <AuthCard title="Nueva contraseña">
      {done ? (
        <>
          <Box role="status" bg="green.50" color="green.900" p={4} borderRadius="md" fontSize="lg">
            Listo: ya puedes entrar con tu contraseña nueva.
          </Box>
          <Button asChild size="lg" colorPalette="orange">
            <NextLink href="/admin/login/">Entrar</NextLink>
          </Button>
        </>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Stack gap={6}>
            <Field.Root invalid={Boolean(errors.password)} required>
              <Field.Label fontSize="lg">Contraseña nueva</Field.Label>
              <PasswordInput {...register('password')} autoComplete="new-password" />
              {!errors.password && <Field.HelperText fontSize="md">Al menos 10 caracteres.</Field.HelperText>}
              <Field.ErrorText fontSize="md">{errors.password?.message}</Field.ErrorText>
            </Field.Root>
            <Field.Root invalid={Boolean(errors.passwordConfirm)} required>
              <Field.Label fontSize="lg">Repite la contraseña</Field.Label>
              <PasswordInput {...register('passwordConfirm')} autoComplete="new-password" />
              <Field.ErrorText fontSize="md">{errors.passwordConfirm?.message}</Field.ErrorText>
            </Field.Root>
            {error && (
              <Text role="alert" color="red.700" fontSize="lg">
                {error}
              </Text>
            )}
            <Button type="submit" size="lg" colorPalette="orange" loading={isSubmitting} loadingText="Guardando…">
              Guardar la contraseña
            </Button>
          </Stack>
        </form>
      )}
    </AuthCard>
  )
}
