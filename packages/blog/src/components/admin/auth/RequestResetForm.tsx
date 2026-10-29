'use client'

import { Box, Button, Field, Input, Link, Stack, Text } from '@chakra-ui/react'
import axios from 'axios'
import NextLink from 'next/link'
import { type FormEvent, useState } from 'react'

import { apiErrorMessage } from '@blog/components/admin/ui/apiError'

import { AuthCard } from './AuthCard'

export function RequestResetForm() {
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await axios.post('/api/password-reset/request/', { email: new FormData(event.currentTarget).get('email') })
      setSent(true)
    } catch (requestError) {
      setError(apiErrorMessage(requestError, 'No se ha podido enviar. Inténtalo de nuevo.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard title="Recuperar la contraseña">
      {sent ? (
        <Box role="status" bg="green.50" color="green.900" p={4} borderRadius="md" fontSize="lg">
          Si ese email tiene cuenta en el panel, te hemos enviado un enlace para poner una contraseña nueva. Mira
          también en la carpeta de correo no deseado. El enlace sirve durante una hora.
        </Box>
      ) : (
        <form onSubmit={handleSubmit}>
          <Stack gap={6}>
            <Text fontSize="lg">Escribe tu email y te enviaremos un enlace para poner una contraseña nueva.</Text>
            <Field.Root required>
              <Field.Label fontSize="lg">Email</Field.Label>
              <Input name="email" type="email" autoComplete="email" size="lg" fontSize="lg" />
            </Field.Root>
            {error && (
              <Text role="alert" color="red.700" fontSize="lg">
                {error}
              </Text>
            )}
            <Button type="submit" size="lg" colorPalette="gold" loading={loading} loadingText="Enviando…">
              Enviar el enlace
            </Button>
          </Stack>
        </form>
      )}
      <Link asChild alignSelf="center" fontSize="md" color="fg.muted">
        <NextLink href="/admin/login/">Volver a entrar</NextLink>
      </Link>
    </AuthCard>
  )
}
