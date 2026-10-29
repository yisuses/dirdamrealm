'use client'

import { Button, VisuallyHidden } from '@chakra-ui/react'
import { ReactNode } from 'react'

interface SocialButtonProps {
  children: ReactNode
  label: string
  href?: string
  onClick?: () => void
}

export const SocialButton = ({ children, label, href, onClick }: SocialButtonProps) => {
  return (
    <Button
      asChild
      variant="outline"
      color="fg.muted"
      borderColor="border"
      rounded="full"
      w={9}
      h={9}
      minW={9}
      p={0}
      cursor="pointer"
      transition="color .2s, border-color .2s"
      _hover={{ color: 'accent', borderColor: 'accent', bg: 'transparent' }}
      onClick={onClick}
    >
      <a href={href} target="_blank" rel="noreferrer">
        <VisuallyHidden>{label}</VisuallyHidden>
        {children}
      </a>
    </Button>
  )
}
