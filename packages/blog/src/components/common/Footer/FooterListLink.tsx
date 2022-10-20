import { Link } from '@chakra-ui/layout'
import NextLink from 'next/link'
import { ReactNode } from 'react'

interface FooterListLinkProps {
  href: string
  children: ReactNode
  target?: string
  forceAnchor?: boolean
}

export const FooterListLink = ({ href, children, target, forceAnchor }: FooterListLinkProps) => {
  return forceAnchor ? (
    <Link href={href} fontWeight="400" fontSize="xs" color="gray.50">
      {children}
    </Link>
  ) : (
    <NextLink href={href} target={target} passHref>
      <Link fontWeight="400" fontSize="xs" color="gray.50">
        {children}
      </Link>
    </NextLink>
  )
}
