import { sendLeadEmail, isMailerConfigured } from '@/lib/mailer'

export async function POST(request) {
  let body
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Requête invalide.' }, { status: 400 })
  }

  const { name, phone, email, message } = body || {}

  if (!name || (!phone && !email)) {
    return Response.json({ error: 'Nom, et téléphone ou email requis.' }, { status: 400 })
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
