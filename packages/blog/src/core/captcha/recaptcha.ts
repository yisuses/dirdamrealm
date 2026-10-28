/**
 * Asks Google whether a reCAPTCHA answer is valid. Without a secret configured every answer is
 * refused: a missing setting must not open the comment form to bots.
 */
export async function verifyRecaptcha(token: string, ip?: string) {
  const secret = process.env.RECAPTCHA_SECRET_KEY
  if (!secret) {
    return false
  }
  const body = new URLSearchParams({ secret, response: token, ...(ip ? { remoteip: ip } : {}) })
  const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    body,
    signal: AbortSignal.timeout(5000),
  })
  const result = (await response.json()) as { success?: boolean }
  return result.success === true
}
