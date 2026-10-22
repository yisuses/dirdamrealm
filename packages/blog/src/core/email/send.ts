import * as sentry from '@sentry/nextjs'
import { Resend } from 'resend'

// Missing in local development: emails are then logged instead of sent.
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

interface Email {
  to: string
  subject: string
  html: string
  text: string
}

/** Sends through Resend from RESEND_FROM_EMAIL. Returns whether it was handed to Resend. */
export async function sendEmail({ to, subject, html, text }: Email) {
  if (!resend || !process.env.RESEND_FROM_EMAIL) {
    console.warn(`Email not sent (Resend is not configured): "${subject}" to ${to}`)
    return false
  }
  const { error } = await resend.emails.send({ from: process.env.RESEND_FROM_EMAIL, to, subject, html, text })
  if (error) {
    sentry.captureException(error)
    return false
  }
  return true
}

/** Text from people (names, comments) goes into email HTML escaped, never as markup. */
export function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, char => `&#${char.charCodeAt(0)};`)
}
