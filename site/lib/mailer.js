import nodemailer from 'nodemailer'
import { CONTACT } from './constants'

let transporter = null

function getTransporter() {
  if (transporter) return transporter

  const user = process.env.GMAIL_USER
  const pass = process.env.GMAIL_APP_PASSWORD

  if (!user || !pass) return null

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  })
  return transporter
}

export function isMailerConfigured() {
  return Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD)
}

export async function sendLeadEmail({ subject, text, replyTo }) {
  const t = getTransporter()
  if (!t) {
    throw new Error(
      'Envoi email non configuré : variables GMAIL_USER / GMAIL_APP_PASSWORD manquantes.'
    )
  }

  await t.sendMail({
    from: `"Site La Clean Compagny" <${process.env.GMAIL_USER}>`,
    to: CONTACT.email,
    replyTo: replyTo || undefined,
    subject,
    text,
  })
}
