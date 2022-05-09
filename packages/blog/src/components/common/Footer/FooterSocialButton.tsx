import { Button } from '@chakra-ui/button'
import { VisuallyHidden } from '@chakra-ui/visually-hidden'
import { ReactNode } from 'react'

interface FooterSocialButtonProps {
  children: ReactNode
  label: string
  href: string
}

export const FooterSocialButton = ({ children, label, href }: FooterSocialButtonProps) => {
  return (
    <Button
      bg="whiteAlpha.100"
      rounded="full"
      w={8}
      h={8}
      cursor="pointer"
      minW={8}
      p={0.5}
      as="a"
      href={href}
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      transition="all 0.2s ease-in"
      _hover={{
        bg: 'whiteAlpha.200',
        color: 'white',
      }}
    >
      <VisuallyHidden>{label}</VisuallyHidden>
      {children}
    </Button>
  )
}
