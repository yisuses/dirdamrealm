import bcrypt from 'bcryptjs'

/** bcrypt, as Strapi used and portfolio-blog uses; the cost is tuned for a login every few days. */
export function hashPassword(password: string) {
  return bcrypt.hash(password, 12)
}
