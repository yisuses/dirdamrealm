import { Link } from '@chakra-ui/layout'
import NextLink from 'next/link'
import { ReactNode } from 'react'

interface FooterListLinkProps {
  href: string
  children: ReactNode
  target?: string
}

export const FooterListLink = ({ href, children, target }: FooterListLinkProps) => {
  return (
    <NextLink href={href} target={target}>
      <Link fontWeight="400" fontSize="xs" mb={2} color="gray.50">
        {children}
      </Link>
    </NextLink>
  )
}
