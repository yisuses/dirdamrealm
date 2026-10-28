import bcrypt from 'bcryptjs'
import { checkBotId } from 'botid/server'

import { getActiveUserByEmail } from '@blog/db/queries/users'

// Compared against when the email is unknown, so a wrong email takes as long as a wrong
// password and response times do not reveal which accounts exist.
const dummyHash = '$2b$10$AdOnz3s2OndVVqu/Bg57zel8uR2QT38tXDAP83dNbI5WiUij0QVBO'

export async function authorizeCredentials(
  credentials: Partial<Record<string, unknown>>,
): Promise<{ id: string; name: string; email: string } | null> {
  const email = typeof credentials?.email === 'string' ? credentials.email : ''
  const password = typeof credentials?.password === 'string' ? credentials.password : ''
  if (!email || !password || (await checkBotId()).isBot) {
    return null
  }

  const user = await getActiveUserByEmail(email)
  // Hashes migrated from Strapi are bcrypt too, so existing passwords keep working.
  const valid = await bcrypt.compare(password, user?.passwordHash ?? dummyHash)
  if (!user || !valid) {
    return null
  }
  return { id: user.id, name: user.name, email: user.email }
}
