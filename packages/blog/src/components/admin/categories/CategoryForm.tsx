'use client'

import { Box, Button, Checkbox, Field, Fieldset, Input, SimpleGrid, Stack, Textarea } from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { AdminPageHeader } from '@blog/components/admin/ui/AdminPageHeader'
import { apiErrorMessage } from '@blog/components/admin/ui/apiError'
import { type CategoryInput, categorySchema } from '@blog/core/validation/category'
import type { AdminCategory } from '@blog/db/queries/admin/categories'

const empty: CategoryInput = {
  code: '',
  main: false,
  es: { name: '', description: '' },
  en: { name: '', description: '' },
}

const languages = [
  { locale: 'es', legend: 'En español' },
  { locale: 'en', legend: 'En inglés' },
] as const

export function CategoryForm({ category }: { category?: AdminCategory }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    control,
    handleSubmit,
    setError: setFieldError,
    formState: { errors, isSubmitting },
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: category ? { code: category.code, main: category.main, es: category.es, en: category.en } : empty,
  })

  async function onSubmit(values: CategoryInput) {
    setError(null)
    try {
      if (category) {
        await axios.put(`/api/admin/categories/${category.id}/`, values)
      } else {
        await axios.post('/api/admin/categories/', values)
      }
      router.push('/admin/categorias/')
      router.refresh()
    } catch (requestError) {
      const message = apiErrorMessage(requestError)
      if (axios.isAxiosError(requestError) && requestError.response?.status === 409) {
        setFieldError('code', { message })
      } else {
        setError(message)
      }
    }
  }

  return (
    <Stack gap={8} as="section">
      <AdminPageHeader title={category ? `Editar «${category.es.name}»` : 'Nueva categoría'} />

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack gap={8} bg="white" borderWidth={1} borderRadius="lg" p={{ base: 4, md: 8 }}>
          <Field.Root invalid={Boolean(errors.code)} required>
            <Field.Label fontSize="lg">Código</Field.Label>
            <Input
              {...register('code', { setValueAs: (value: string) => value.toUpperCase() })}
              size="lg"
              fontSize="lg"
              fontFamily="mono"
              maxW="sm"
              autoComplete="off"
            />
            <Field.HelperText fontSize="md">
              Aparece en la dirección de la categoría (por ejemplo, /category/VIAJES/viajes/). Si lo cambias, cambian
              sus direcciones.
            </Field.HelperText>
            <Field.ErrorText fontSize="md">{errors.code?.message}</Field.ErrorText>
          </Field.Root>

          <Controller
            control={control}
            name="main"
            render={({ field }) => (
              <Checkbox.Root
                checked={field.value}
                onCheckedChange={({ checked }) => field.onChange(checked === true)}
                size="lg"
              >
                <Checkbox.HiddenInput />
                <Checkbox.Control />
                <Checkbox.Label fontSize="lg">Aparece en el menú principal de la web</Checkbox.Label>
              </Checkbox.Root>
            )}
          />

          <SimpleGrid columns={{ base: 1, lg: 2 }} gap={8}>
            {languages.map(({ locale, legend }) => (
              <Fieldset.Root key={locale}>
                <Fieldset.Legend fontSize="xl" fontFamily="Roboto" fontWeight="bold" mb={4}>
                  {legend}
                </Fieldset.Legend>
                <Stack gap={5}>
                  <Field.Root invalid={Boolean(errors[locale]?.name)} required>
                    <Field.Label fontSize="lg">Nombre</Field.Label>
                    <Input {...register(`${locale}.name`)} size="lg" fontSize="lg" />
                    <Field.ErrorText fontSize="md">{errors[locale]?.name?.message}</Field.ErrorText>
                  </Field.Root>
                  <Field.Root invalid={Boolean(errors[locale]?.description)}>
                    <Field.Label fontSize="lg">Descripción</Field.Label>
                    <Textarea {...register(`${locale}.description`)} size="lg" fontSize="lg" rows={4} />
                    <Field.ErrorText fontSize="md">{errors[locale]?.description?.message}</Field.ErrorText>
                  </Field.Root>
                </Stack>
              </Fieldset.Root>
            ))}
          </SimpleGrid>

          {error && (
            <Box role="alert" bg="red.50" color="red.900" p={4} borderRadius="md">
              {error}
            </Box>
          )}

          <Stack direction={{ base: 'column', sm: 'row' }} gap={4}>
            <Button type="submit" colorPalette="orange" size="lg" loading={isSubmitting} loadingText="Guardando…">
              Guardar
            </Button>
            <Button asChild variant="outline" size="lg">
              <NextLink href="/admin/categorias/">Cancelar</NextLink>
            </Button>
          </Stack>
        </Stack>
      </form>
    </Stack>
  )
}
