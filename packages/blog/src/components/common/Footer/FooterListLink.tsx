'use client'

import { Link } from '@chakra-ui/react'
import NextLink from 'next/link'
import { ReactNode } from 'react'

interface FooterListLinkProps {
  href: string
  children: ReactNode
  target?: string
  forceAnchor?: boolean
}

const linkStyles = {
  fontFamily: 'sans',
  fontSize: '15px',
  color: 'fg',
  width: 'fit-content',
  _hover: { color: 'accent', textDecoration: 'none' },
} as const

export const FooterListLink = ({ href, children, target, forceAnchor }: FooterListLinkProps) => {
  return forceAnchor ? (
    <Link href={href} {...linkStyles}>
      {children}
    </Link>
  ) : (
    <Link asChild target={target} {...linkStyles}>
      <NextLink href={href}>{children}</NextLink>
    </Link>
  )
}
