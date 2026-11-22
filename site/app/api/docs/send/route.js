import { teamClient, logoBytes } from '@/lib/server/team'
import { isMailerConfigured, sendAsEnzo } from '@/lib/mailer'
import { buildDocPdf } from '@/lib/invoicePdf'
import { docEmail, pdfFileName, isDraftNumber } from '@/lib/invoice'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// L'envoi par mail est-il prêt ? (mot de passe d'application Gmail renseigné sur Vercel)
export async function GET() {
  return Response.json({ configured: isMailerConfigured() })
}

// Envoie un devis / une facture / un avoir au client : mail + PDF joint, copie à Enzo.
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
  const [{ data: doc }, { data: st }] = await Promise.all([
    db.from('documents').select('*').eq('id', body?.id).maybeSingle(),
    db.from('settings').select('business').eq('id', 1).maybeSingle(),
  ])
  if (!doc) return Response.json({ error: 'introuvable' }, { status: 404 })
  if (doc.kind !== 'devis' && (doc.status === 'brouillon' || isDraftNumber(doc.number))) {
    return Response.json({ error: 'a_valider' }, { status: 409 })
  }
  const to = String(body?.to || doc.client?.email || '').trim()
  if (!EMAIL_RE.test(to)) return Response.json({ error: 'email' }, { status: 400 })

  const current = st?.business || {}
  const biz = doc.issuer ? { ...current, ...Object.fromEntries(Object.entries(doc.issuer).filter(([, v]) => v !== '' && v !== null)) } : current
  const pdf = await buildDocPdf(doc, biz, await logoBytes(request))
  const mail = docEmail(doc, biz)
  try {
    await sendAsEnzo({
      to,
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
      attachments: [{ filename: pdfFileName(doc), content: Buffer.from(pdf), contentType: 'application/pdf' }],
    })
  } catch (e) {
    console.error('docs/send', e)
    return Response.json({ error: 'envoi' }, { status: 502 })
  }

  const changes = { sent_at: new Date().toISOString(), sent_to: to }
  if (doc.kind === 'devis' && doc.status === 'brouillon') changes.status = 'envoye'
  const { data: saved } = await db.from('documents').update(changes).eq('id', doc.id).select().single()
  return Response.json({ ok: true, doc: saved || { ...doc, ...changes } })
}
