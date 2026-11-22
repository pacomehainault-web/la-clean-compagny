import { teamClient } from '@/lib/server/team'
import { isMailerConfigured, sendAsEnzo } from '@/lib/mailer'
import { photoUrl } from '@/lib/photos'
import { CONTACT, SITE } from '@/lib/constants'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// Demande d'avis par mail : photos avant/après de SA voiture, bouton pour les enregistrer,
// lien d'avis Google qui garde « Ajouter des photos ». Copie cachée à Enzo.
export async function POST(request) {
  const db = await teamClient(request)
  if (!db) return Response.json({ error: 'forbidden' }, { status: 403 })
  if (!isMailerConfigured()) return Response.json({ error: 'gmail_non_configure' }, { status: 503 })
  let body
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'requete' }, { status: 400 })
  }
  const { data: lead } = await db.from('leads').select('id, first_name, email, vehicle, track_token').eq('id', body?.lead_id).maybeSingle()
  if (!lead) return Response.json({ error: 'introuvable' }, { status: 404 })
  const to = String(body?.to || lead.email || '').trim()
  if (!EMAIL_RE.test(to)) return Response.json({ error: 'email' }, { status: 400 })

  const { data: rows } = await db.from('photos').select('kind, path, taken_on, created_at').eq('lead_id', lead.id).in('kind', ['avant', 'apres']).order('created_at')
  const last = (rows || []).reduce((m, p) => (p.taken_on > m ? p.taken_on : m), '')
  const photos = (rows || []).filter((p) => p.taken_on === last)
  const befores = photos.filter((p) => p.kind === 'avant').slice(0, 3)
  const afters = photos.filter((p) => p.kind === 'apres').slice(0, 3)

  const name = lead.first_name || ''
  const page = lead.track_token ? `${SITE.url}/suivi/${lead.track_token}` : ''
  const review = CONTACT.googleReviewPhotoUrl
  const img = (p, label) =>
    `<td style="padding:4px;width:50%;vertical-align:top"><img src="${esc(photoUrl(p.path))}" alt="${label}" width="260" style="width:100%;max-width:260px;border-radius:10px;display:block"><div style="font-size:12px;color:#667;text-align:center;padding-top:4px">${label}</div></td>`
  const pairs = []
  for (let i = 0; i < Math.max(befores.length, afters.length); i += 1) {
    pairs.push(`<tr>${befores[i] ? img(befores[i], 'Avant') : '<td></td>'}${afters[i] ? img(afters[i], 'Après') : '<td></td>'}</tr>`)
  }
  const btn = (href, label, bg) =>
    `<a href="${esc(href)}" style="display:inline-block;background:${bg};color:#fff;text-decoration:none;font-weight:bold;padding:13px 20px;border-radius:10px;margin:4px 0">${label}</a>`

  const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#1a1a1a;max-width:560px">
<p>Bonjour <strong>${esc(name)}</strong>,</p>
<p>Merci encore pour votre confiance ! Voici ${lead.vehicle ? `votre ${esc(lead.vehicle)}` : 'votre voiture'} avant / après le nettoyage :</p>
${pairs.length ? `<table role="presentation" cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse">${pairs.join('')}</table>` : ''}
${page ? `<p style="margin-top:14px">${btn(page, '📸 Télécharger mes photos', '#15171b')}</p>` : ''}
<p style="margin-top:18px">Si le résultat vous a plu, un petit avis Google nous aiderait énormément (30 secondes) :</p>
<p>${btn(review, '⭐ Laisser mon avis Google', '#2f52d0')}</p>
<p style="font-size:13px;color:#555">Astuce : enregistrez une photo ci-dessus, puis touchez « Ajouter des photos » en écrivant l'avis ✨</p>
<p>Cordialement,<br>Enzo de La Clean Compagny</p>
</div>`
  const text = `Bonjour ${name},\n\nMerci encore pour votre confiance !${page ? `\n\nVos photos avant / après : ${page}` : ''}\n\nSi le résultat vous a plu, un petit avis Google nous aiderait énormément (30 secondes) : ${review}\nAstuce : enregistrez une photo, puis touchez « Ajouter des photos » en écrivant l'avis.\n\nCordialement,\nEnzo de La Clean Compagny`

  try {
    await sendAsEnzo({ to, subject: `${name ? `${name}, v` : 'V'}os photos avant / après – La Clean Compagny`, text, html })
  } catch (e) {
    console.error('review-request', e)
    return Response.json({ error: 'envoi' }, { status: 502 })
  }
  return Response.json({ ok: true, photos: photos.length })
}
