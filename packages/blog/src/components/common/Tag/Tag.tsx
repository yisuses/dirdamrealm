'use client'

import { Text, TextProps } from '@chakra-ui/react'

interface TagProps extends TextProps {
  label: string
  /** `solid` sits on a photo as a gold label; `text` is the plain gold kicker above a title. */
  variant?: 'text' | 'solid'
}

export function Tag({ label, variant = 'text', ...rest }: TagProps) {
  return (
    <Text
      as="span"
      aria-label={label}
      display="inline-block"
      fontFamily="sans"
      fontSize="12px"
      fontWeight={600}
      letterSpacing="0.08em"
      lineHeight="1.4"
      textTransform="uppercase"
      {...(variant === 'solid'
        ? { bg: 'accent', color: 'accent.contrast', px: '10px', py: '4px', borderRadius: '4px' }
        : { color: 'accent' })}
      {...rest}
    >
      {label}
    </Text>
  )
}
