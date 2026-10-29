'use client'

import { Box, Button, Field, Input, NativeSelect, Stack } from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { AdminPageHeader } from '@blog/components/admin/ui/AdminPageHeader'
import { apiErrorMessage } from '@blog/components/admin/ui/apiError'
import { type WriterInput, writerSchema } from '@blog/core/validation/writer'
import type { AdminWriter } from '@blog/db/queries/admin/writers'

interface WriterFormProps {
  writer?: AdminWriter
  users: { id: string; name: string }[]
}

export function WriterForm({ writer, users }: WriterFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<WriterInput>({
    resolver: zodResolver(writerSchema),
    defaultValues: writer
      ? { name: writer.name, twitter: writer.twitter, personalUrl: writer.personalUrl, userId: writer.userId }
      : { name: '', twitter: '', personalUrl: '', userId: '' },
  })

  async function onSubmit(values: WriterInput) {
    setError(null)
    try {
      if (writer) {
        await axios.put(`/api/admin/writers/${writer.id}/`, values)
      } else {
        await axios.post('/api/admin/writers/', values)
      }
      router.push('/admin/autores/')
      router.refresh()
    } catch (requestError) {
      setError(apiErrorMessage(requestError))
    }
  }

  return (
    <Stack gap={8} as="section">
      <AdminPageHeader title={writer ? `Editar a ${writer.name}` : 'Nuevo autor'} />

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack gap={6} bg="bg.panel" borderWidth={1} borderRadius="lg" p={{ base: 4, md: 8 }}>
          <Field.Root invalid={Boolean(errors.name)} required>
            <Field.Label fontSize="lg">Nombre</Field.Label>
            <Input {...register('name')} size="lg" fontSize="lg" />
            <Field.HelperText fontSize="md">Tal y como aparece en las entradas.</Field.HelperText>
            <Field.ErrorText fontSize="md">{errors.name?.message}</Field.ErrorText>
          </Field.Root>
          <Field.Root invalid={Boolean(errors.twitter)}>
            <Field.Label fontSize="lg">Usuario de Twitter / X</Field.Label>
            <Input {...register('twitter')} size="lg" fontSize="lg" placeholder="@usuario" />
            <Field.ErrorText fontSize="md">{errors.twitter?.message}</Field.ErrorText>
          </Field.Root>
          <Field.Root invalid={Boolean(errors.personalUrl)}>
            <Field.Label fontSize="lg">Web personal</Field.Label>
            <Input {...register('personalUrl')} type="url" size="lg" fontSize="lg" placeholder="https://" />
            <Field.ErrorText fontSize="md">{errors.personalUrl?.message}</Field.ErrorText>
          </Field.Root>
          <Field.Root>
            <Field.Label fontSize="lg">Usuario del panel</Field.Label>
            <NativeSelect.Root size="lg">
              <NativeSelect.Field {...register('userId')} fontSize="lg">
                <option value="">Ninguno</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
            <Field.HelperText fontSize="md">La persona que entra en el panel con esta firma.</Field.HelperText>
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
              <NextLink href="/admin/autores/">Cancelar</NextLink>
            </Button>
          </Stack>
        </Stack>
      </form>
    </Stack>
  )
}
