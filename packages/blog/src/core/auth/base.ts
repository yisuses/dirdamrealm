import type { NextAuthConfig } from 'next-auth'

export const loginPath = '/admin/login/'

/**
 * Everything but the providers. The proxy decodes sessions with this alone, so it never
 * loads the credentials provider and, through it, the database driver.
 */
export const baseAuthConfig = {
  providers: [],
  secret: process.env.AUTH_SECRET,
  // A working day; the proxy never extends it (see withoutSessionRefresh).
  session: { strategy: 'jwt', maxAge: 8 * 60 * 60 },
  pages: { signIn: loginPath },
  trustHost: true,
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) {
        token.sub = user.id
      }
      return token
    },
    session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub
      }
      return session
    },
  },
} satisfies NextAuthConfig
