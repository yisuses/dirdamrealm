import { Button } from '@chakra-ui/button'
import { VisuallyHidden } from '@chakra-ui/visually-hidden'
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
      as="a"
      href={href}
      target="_blank"
      bg="whiteAlpha.100"
      rounded="full"
      w={8}
      h={8}
      cursor="pointer"
      minW={8}
      p={0.5}
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      transition="all 0.2s ease-in"
      _hover={{
        bg: 'whiteAlpha.200',
        transform: 'scale(1.1) translateY(-2px)',
      }}
      onClick={onClick}
    >
      <VisuallyHidden>{label}</VisuallyHidden>
      {children}
    </Button>
  )
}
