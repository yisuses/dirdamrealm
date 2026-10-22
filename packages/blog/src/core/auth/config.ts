import nextAuth from 'next-auth'
import credentials from 'next-auth/providers/credentials'

import { baseAuthConfig } from './base'
import { authorizeCredentials } from './credentials'

export { loginPath } from './base'

export const { handlers, auth, signIn, signOut } = nextAuth({
  ...baseAuthConfig,
  providers: [
    credentials({
      credentials: { email: { type: 'email' }, password: { type: 'password' } },
      authorize: authorizeCredentials,
    }),
  ],
})
