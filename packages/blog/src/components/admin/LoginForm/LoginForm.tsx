'use client'

import { Button, Field, Input, Link, Stack, Text } from '@chakra-ui/react'
import { signIn } from 'next-auth/react'
import NextLink from 'next/link'
import { type FormEvent, useState } from 'react'

import { AuthCard } from '@blog/components/admin/auth/AuthCard'
import { PasswordInput } from '@blog/components/admin/ui/PasswordInput'

export function LoginForm() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setLoading(true)
    const form = new FormData(event.currentTarget)
    const result = await signIn('credentials', {
      email: form.get('email'),
      password: form.get('password'),
      redirect: false,
    })
    setLoading(false)
    if (result?.status === 429) {
      setError('Demasiados intentos. Espera un minuto y vuelve a probar.')
    } else if (result?.error) {
      setError('El email o la contraseña no son correctos.')
    } else {
      // A full load, so the server renders the panel with the new session cookie.
      window.location.assign('/admin/')
    }
  }

  return (
    <AuthCard title="Panel de Emoción Blanca">
      <form onSubmit={handleSubmit}>
        <Stack gap={6}>
          <Field.Root required>
            <Field.Label fontSize="lg">Email</Field.Label>
            <Input name="email" type="email" autoComplete="email" size="lg" fontSize="lg" />
          </Field.Root>

          <Field.Root required>
            <Field.Label fontSize="lg">Contraseña</Field.Label>
            <PasswordInput name="password" autoComplete="current-password" />
          </Field.Root>

          {error && (
            <Text role="alert" color="red.700" fontSize="lg">
              {error}
            </Text>
          )}

          <Button type="submit" size="lg" fontSize="lg" colorPalette="gold" loading={loading} loadingText="Entrando…">
            Entrar
          </Button>

          <Link asChild alignSelf="center" fontSize="md" color="fg.muted">
            <NextLink href="/admin/recuperar-contrasena/">¿Has olvidado la contraseña?</NextLink>
          </Link>
        </Stack>
      </form>
    </AuthCard>
  )
}
