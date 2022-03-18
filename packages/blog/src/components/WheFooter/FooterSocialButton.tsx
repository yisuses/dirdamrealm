import { chakra, VisuallyHidden } from '@chakra-ui/react'
import { ReactNode } from 'react'

interface FooterSocialButtonProps {
  children: ReactNode
  label: string
  href: string
}

export const FooterSocialButton = ({ children, label, href }: FooterSocialButtonProps) => {
  return (
    <chakra.button
      bg="whiteAlpha.100"
      rounded="full"
      w={8}
      h={8}
      cursor="pointer"
      as="a"
      href={href}
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
    >
      <VisuallyHidden>{label}</VisuallyHidden>
      {children}
    </chakra.button>
  )
}
