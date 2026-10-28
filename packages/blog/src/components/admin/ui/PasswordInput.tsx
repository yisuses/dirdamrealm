'use client'

import { Button, Group, Input, type InputProps } from '@chakra-ui/react'
import { forwardRef, useState } from 'react'

/** A password field with a "Mostrar" button, so what was typed can be checked before sending. */
export const PasswordInput = forwardRef<HTMLInputElement, InputProps>(function PasswordInput(props, ref) {
  const [visible, setVisible] = useState(false)
  return (
    <Group attached w="full">
      <Input ref={ref} {...props} type={visible ? 'text' : 'password'} size="lg" fontSize="lg" />
      <Button
        type="button"
        variant="outline"
        size="lg"
        onClick={() => setVisible(value => !value)}
        aria-pressed={visible}
        aria-label={visible ? 'Ocultar la contraseña' : 'Mostrar la contraseña'}
      >
        {visible ? 'Ocultar' : 'Mostrar'}
      </Button>
    </Group>
  )
})
