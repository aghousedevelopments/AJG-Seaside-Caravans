// lib/sendEmail.ts
import sgMail from '@sendgrid/mail'

const apiKey = process.env.SENDGRID_API_KEY
if (apiKey) sgMail.setApiKey(apiKey)

export default async function sendEmail({ to, subject, text, html }: { to: string; subject: string; text?: string; html?: string }) {
  if (!apiKey) {
    console.warn('SENDGRID_API_KEY not set — skipping email send')
    return
  }
  const msg = {
    to,
    from: process.env.SENDGRID_FROM || 'no-reply@' + (process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, '') || 'localhost'),
    subject,
    text,
    html
  }
  try {
    await sgMail.send(msg)
  } catch (err: any) {
    console.error('Error sending email', err?.response?.body || err.message || err)
  }
}
