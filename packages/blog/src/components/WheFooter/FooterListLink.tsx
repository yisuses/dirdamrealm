import { Link } from '@chakra-ui/react'
import { ReactNode } from 'react'

interface NavLinkProps {
  href: string
  children: ReactNode
}

export const FooterListLink = ({ href, children }: NavLinkProps) => {
  return (
    <Link href={href} fontWeight="400" fontSize="xs" mb={2} color="gray.50">
      {children}
    </Link>
  )
}