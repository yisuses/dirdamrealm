'use client'

import { Box, Button, Field, Heading, Input, Link, Stack, Text } from '@chakra-ui/react'
import { signIn } from 'next-auth/react'
import NextLink from 'next/link'
import { type FormEvent, useState } from 'react'

import { HeaderLogo } from '@blog/components/common/Icon/HeaderLogo'

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
    <Box as="main" minH="100vh" bg="gray.50" display="flex" alignItems="center" justifyContent="center" p={4}>
      <Box as="section" bg="white" borderRadius="lg" boxShadow="lg" p={{ base: 6, md: 10 }} w="full" maxW="md">
        <form onSubmit={handleSubmit}>
          <Stack gap={6}>
            <Stack align="center" gap={3}>
              <Box color="gray.900" w="72px" aria-hidden>
                <HeaderLogo />
              </Box>
              <Heading as="h1" size="2xl" fontFamily="Roboto" textAlign="center">
                Panel de Emoción Blanca
              </Heading>
            </Stack>

            <Field.Root required>
              <Field.Label fontSize="lg">Email</Field.Label>
              <Input name="email" type="email" autoComplete="email" size="lg" fontSize="lg" />
            </Field.Root>

            <Field.Root required>
              <Field.Label fontSize="lg">Contraseña</Field.Label>
              <Input name="password" type="password" autoComplete="current-password" size="lg" fontSize="lg" />
            </Field.Root>

            {error && (
              <Text role="alert" color="red.700" fontSize="lg">
                {error}
              </Text>
            )}

            <Button
              type="submit"
              size="lg"
              fontSize="lg"
              colorPalette="orange"
              loading={loading}
              loadingText="Entrando…"
            >
              Entrar
            </Button>

            <Link asChild alignSelf="center" fontSize="md" color="gray.700">
              <NextLink href="/admin/recuperar-contrasena/">¿Has olvidado la contraseña?</NextLink>
            </Link>
          </Stack>
        </form>
      </Box>
    </Box>
  )
}
