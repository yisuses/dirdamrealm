'use client'

import { Box, Button, Checkbox, Field, Fieldset, Flex, Input, NativeSelect, Stack, Text } from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { useState } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'

import { AdminPageHeader } from '@blog/components/admin/ui/AdminPageHeader'
import { apiErrorMessage } from '@blog/components/admin/ui/apiError'
import { type ContactInput, contactSchema, socialNetworkLabels, socialNetworks } from '@blog/core/validation/contact'

function VisibleCheckbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (value: boolean) => void
  label: string
}) {
  return (
    <Checkbox.Root checked={checked} onCheckedChange={({ checked: value }) => onChange(value === true)} size="lg">
      <Checkbox.HiddenInput />
      <Checkbox.Control />
      <Checkbox.Label fontSize="lg">{label}</Checkbox.Label>
    </Checkbox.Root>
  )
}

export function ContactForm({ contact }: { contact: ContactInput }) {
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null)
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({ resolver: zodResolver(contactSchema), defaultValues: contact })
  const { fields, append, remove, move } = useFieldArray({ control, name: 'socialLinks' })

  const used = watch('socialLinks').map(link => link.network)
  const nextNetwork = socialNetworks.find(network => !used.includes(network))

  async function onSubmit(values: ContactInput) {
    setStatus(null)
    try {
      await axios.put('/api/admin/contact/', values)
      setStatus({ ok: true, text: 'Guardado. La web se actualizará en unos segundos.' })
    } catch (error) {
      setStatus({ ok: false, text: apiErrorMessage(error) })
    }
  }

  return (
    <Stack gap={8}>
      <AdminPageHeader
        title="Contacto y redes"
        description="Lo que aparece en el pie de todas las páginas de la web."
      />

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack gap={8}>
          <Box bg="white" borderWidth={1} borderRadius="lg" p={{ base: 4, md: 8 }}>
            <Fieldset.Root>
              <Fieldset.Legend fontSize="xl" fontFamily="Roboto" fontWeight="bold" mb={4}>
                Datos de contacto
              </Fieldset.Legend>
              <Stack gap={5}>
                <Controller
                  control={control}
                  name="display"
                  render={({ field }) => (
                    <VisibleCheckbox
                      checked={field.value}
                      onChange={field.onChange}
                      label="Mostrar el contacto y las redes en la web"
                    />
                  )}
                />
                <Field.Root invalid={Boolean(errors.name)}>
                  <Field.Label fontSize="lg">Nombre</Field.Label>
                  <Input {...register('name')} size="lg" fontSize="lg" />
                  <Field.ErrorText fontSize="md">{errors.name?.message}</Field.ErrorText>
                </Field.Root>
                <Field.Root invalid={Boolean(errors.email)}>
                  <Field.Label fontSize="lg">Email</Field.Label>
                  <Input {...register('email')} type="email" size="lg" fontSize="lg" />
                  <Field.ErrorText fontSize="md">{errors.email?.message}</Field.ErrorText>
                </Field.Root>
              </Stack>
            </Fieldset.Root>
          </Box>

          <Box bg="white" borderWidth={1} borderRadius="lg" p={{ base: 4, md: 8 }}>
            <Fieldset.Root invalid={Boolean(errors.socialLinks?.root)}>
              <Fieldset.Legend fontSize="xl" fontFamily="Roboto" fontWeight="bold" mb={4}>
                Redes sociales
              </Fieldset.Legend>
              <Stack gap={6}>
                {fields.length === 0 && <Text>No hay ninguna red. Añade la primera.</Text>}
                {fields.map((field, index) => {
                  const label = socialNetworkLabels[watch(`socialLinks.${index}.network`)]
                  const linkErrors = errors.socialLinks?.[index]
                  return (
                    <Stack
                      key={field.id}
                      gap={4}
                      borderWidth={1}
                      borderRadius="md"
                      p={4}
                      role="group"
                      aria-label={label}
                    >
                      <Flex gap={4} direction={{ base: 'column', md: 'row' }}>
                        <Field.Root maxW={{ md: '220px' }}>
                          <Field.Label fontSize="lg">Red</Field.Label>
                          <NativeSelect.Root size="lg">
                            <NativeSelect.Field {...register(`socialLinks.${index}.network`)} fontSize="lg">
                              {socialNetworks.map(network => (
                                <option key={network} value={network}>
                                  {socialNetworkLabels[network]}
                                </option>
                              ))}
                            </NativeSelect.Field>
                            <NativeSelect.Indicator />
                          </NativeSelect.Root>
                        </Field.Root>
                        <Field.Root invalid={Boolean(linkErrors?.handle)} maxW={{ md: '220px' }}>
                          <Field.Label fontSize="lg">Usuario</Field.Label>
                          <Input
                            {...register(`socialLinks.${index}.handle`)}
                            size="lg"
                            fontSize="lg"
                            placeholder="@usuario"
                          />
                          <Field.ErrorText fontSize="md">{linkErrors?.handle?.message}</Field.ErrorText>
                        </Field.Root>
                        <Field.Root invalid={Boolean(linkErrors?.url)} required flex={1}>
                          <Field.Label fontSize="lg">Dirección</Field.Label>
                          <Input
                            {...register(`socialLinks.${index}.url`)}
                            type="url"
                            size="lg"
                            fontSize="lg"
                            placeholder="https://"
                          />
                          <Field.ErrorText fontSize="md">{linkErrors?.url?.message}</Field.ErrorText>
                        </Field.Root>
                      </Flex>
                      <Flex gap={3} align="center" wrap="wrap" justify="space-between">
                        <Controller
                          control={control}
                          name={`socialLinks.${index}.visible`}
                          render={({ field: visible }) => (
                            <VisibleCheckbox
                              checked={visible.value}
                              onChange={visible.onChange}
                              label="Visible en la web"
                            />
                          )}
                        />
                        <Flex gap={2} wrap="wrap">
                          <Button
                            variant="outline"
                            onClick={() => move(index, index - 1)}
                            disabled={index === 0}
                            aria-label={`Subir ${label}`}
                          >
                            Subir
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => move(index, index + 1)}
                            disabled={index === fields.length - 1}
                            aria-label={`Bajar ${label}`}
                          >
                            Bajar
                          </Button>
                          <Button
                            variant="outline"
                            colorPalette="red"
                            onClick={() => remove(index)}
                            aria-label={`Quitar ${label}`}
                          >
                            Quitar
                          </Button>
                        </Flex>
                      </Flex>
                    </Stack>
                  )
                })}
                <Fieldset.ErrorText fontSize="md">{errors.socialLinks?.root?.message}</Fieldset.ErrorText>
                {nextNetwork && (
                  <Button
                    alignSelf="flex-start"
                    variant="outline"
                    size="lg"
                    onClick={() => append({ network: nextNetwork, handle: '', url: '', visible: true })}
                  >
                    Añadir red
                  </Button>
                )}
              </Stack>
            </Fieldset.Root>
          </Box>

          {status && (
            <Box
              role="status"
              bg={status.ok ? 'green.50' : 'red.50'}
              color={status.ok ? 'green.900' : 'red.900'}
              p={4}
              borderRadius="md"
            >
              {status.text}
            </Box>
          )}

          <Button
            type="submit"
            alignSelf="flex-start"
            colorPalette="orange"
            size="lg"
            loading={isSubmitting}
            loadingText="Guardando…"
          >
            Guardar
          </Button>
        </Stack>
      </form>
    </Stack>
  )
}
