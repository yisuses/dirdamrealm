'use client'

import { Checkbox, Field, Fieldset, NativeSelect, SimpleGrid, Stack } from '@chakra-ui/react'

interface CategoriesFieldProps {
  options: { id: string; name: string }[]
  value: string[]
  onChange: (value: string[]) => void
}

/** Which categories the post is in, and which one is its main one (always the first). */
export function CategoriesField({ options, value, onChange }: CategoriesFieldProps) {
  const toggle = (id: string, checked: boolean) =>
    onChange(checked ? [...value, id] : value.filter(other => other !== id))
  const nameOf = (id: string) => options.find(option => option.id === id)?.name ?? ''

  return (
    <Stack gap={4}>
      <Fieldset.Root>
        <Fieldset.Legend fontSize="lg" fontWeight="medium">
          Categorías
        </Fieldset.Legend>
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={2} mt={2}>
          {options.map(option => (
            <Checkbox.Root
              key={option.id}
              checked={value.includes(option.id)}
              onCheckedChange={({ checked }) => toggle(option.id, checked === true)}
            >
              <Checkbox.HiddenInput />
              <Checkbox.Control />
              <Checkbox.Label>{option.name}</Checkbox.Label>
            </Checkbox.Root>
          ))}
        </SimpleGrid>
      </Fieldset.Root>
      {value.length > 1 && (
        <Field.Root>
          <Field.Label>Categoría principal</Field.Label>
          <NativeSelect.Root maxW="sm">
            <NativeSelect.Field
              value={value[0]}
              onChange={event => onChange([event.target.value, ...value.filter(id => id !== event.target.value)])}
            >
              {value.map(id => (
                <option key={id} value={id}>
                  {nameOf(id)}
                </option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
          <Field.HelperText>La que se muestra primero, y con la que se buscan entradas parecidas.</Field.HelperText>
        </Field.Root>
      )}
    </Stack>
  )
}
