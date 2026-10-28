import { redirect } from 'next/navigation'
import { describe, expect, it, vi } from 'vitest'

import { signOut } from '@blog/core/auth/config'

import { logout } from './actions'
import AdminLayout, { dynamic, metadata } from './layout'
import LoginPage from './login/page'

vi.mock('@blog/core/auth/config', () => ({ loginPath: '/admin/login/', signOut: vi.fn() }))
vi.mock('next/navigation', () => ({ redirect: vi.fn() }))

describe('admin root', () => {
  it('should keep the panel out of search engines and the ISR cache', () => {
    expect(metadata.robots).toEqual({ index: false, follow: false })
    expect(dynamic).toBe('force-dynamic')
  })

  it('should render its own document in Spanish with the site fonts and providers', () => {
    const element = AdminLayout({ children: <p>Hola</p> })

    expect(element.props.lang).toBe('es')
    expect(JSON.stringify(element.props.children)).toContain('fonts.googleapis.com')
  })

  it('should render the login form on the login page', () => {
    expect(LoginPage().type.name).toBe('LoginForm')
  })

  it('should end the session and go back to the login page on logout', async () => {
    await logout()

    expect(signOut).toHaveBeenCalledWith({ redirect: false })
    expect(redirect).toHaveBeenCalledWith('/admin/login/')
  })
})
