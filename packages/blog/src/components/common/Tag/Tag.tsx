'use client'

import { Tag as ChakraTag } from '@chakra-ui/react'
import { ComponentProps } from 'react'

interface TagProps extends ComponentProps<typeof ChakraTag.Root> {
  label: string
}

export function Tag({ label, size, ...rest }: TagProps) {
  return (
    <ChakraTag.Root
      aria-label={label}
      size={size}
      {...rest}
      variant="outline"
      boxShadow="none"
      bgColor="blackAlpha.500"
    >
      <ChakraTag.Label fontFamily="Roboto" textTransform="uppercase" color="white" fontSize={12} fontWeight={500}>
        {label}
      </ChakraTag.Label>
    </ChakraTag.Root>
  )
}
