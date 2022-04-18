import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { Children, cloneElement, ReactElement, ReactNode } from 'react'

interface NavLinkProps {
  children: ReactNode
  href: string
}

export const NavLink = ({ children, href }: NavLinkProps) => {
  const child = Children.only(children)
  const router = useRouter()
  return (
    <Link href={href}>
      {cloneElement(child as ReactElement, {
        'aria-current': router.pathname === href ? 'page' : null,
      })}
    </Link>
  )
}
