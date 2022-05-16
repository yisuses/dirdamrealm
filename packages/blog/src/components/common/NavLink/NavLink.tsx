import Link from 'next/link'
import React, { ReactNode } from 'react'

interface NavLinkProps {
  children: ReactNode
  href: string
}

export const NavLink = ({ children, href }: NavLinkProps) => {
  return <Link href={href}>{children}</Link>
}
