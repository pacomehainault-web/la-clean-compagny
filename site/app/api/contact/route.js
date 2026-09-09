import { sendLeadEmail, isMailerConfigured } from '@/lib/mailer'
import { sanitizeField, sanitizeMessage, isValidEmail } from '@/lib/sanitize'
import { isRateLimited, getClientIp } from '@/lib/rateLimit'

export async function POST(request) {
  let body
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Requête invalide.' }, { status: 400 })
  }

  // Honeypot : un bot naïf qui remplit tous les champs du formulaire remplit
  // aussi celui-ci (invisible côté navigateur). Faux succès silencieux, sans
  // toucher à l'envoi d'email ni révéler que la requête a été détectée comme
  // du spam.
  if (body?.honeypot) {
    return Response.json({ ok: true })
  }

  const ip = getClientIp(request)
  if (isRateLimited(ip)) {
    return Response.json({ error: 'Trop de demandes, merci de réessayer plus tard.' }, { status: 429 })
  }

  const name = sanitizeField(body?.name)
  const phone = sanitizeField(body?.phone, 40)
  const email = sanitizeField(body?.email, 254)
  const message = sanitizeMessage(body?.message)

  if (!name || (!phone && !email)) {
    return Response.json({ error: 'Nom, et téléphone ou email requis.' }, { status: 400 })
  }
  if (email && !isValidEmail(email)) {
    return Response.json({ error: 'Adresse email invalide.' }, { status: 400 })
  }

  if (!isMailerConfigured()) {
    return Response.json(
      { error: "L'envoi par email n'est pas encore configuré sur ce site (voir README)." },
      { status: 503 }
    )
  }

  try {
    await sendLeadEmail({
      subject: `Nouveau message depuis le site — ${name}`,
      text: message || '',
      replyTo: email || undefined,
    })
    return Response.json({ ok: true })
  } catch (err) {
    console.error('Erreur envoi contact :', err)
    return Response.json({ error: "L'envoi a échoué, merci de réessayer." }, { status: 500 })
  }
}
