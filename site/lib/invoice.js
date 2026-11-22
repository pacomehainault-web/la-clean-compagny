// Calculs et textes communs aux devis / factures / avoirs (navigateur ET serveur).
// Convention : les prix des lignes sont HT. vat_rate = null => ancien document sans TVA.

export const DOC_LABEL = { devis: 'Devis', facture: 'Facture', avoir: 'Avoir' }

const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100

export function lineHt(l) {
  return r2((Number(l.qty) || 0) * (Number(l.unit_price) || 0))
}

// Totaux d'un document : brut HT, remise, HT, TVA, TTC.
export function docAmounts(doc) {
  const lines = doc?.lines || []
  const rate = doc?.vat_rate === null || doc?.vat_rate === undefined || doc?.vat_rate === '' ? null : Number(doc.vat_rate)
  const pct = Math.min(100, Math.max(0, Number(doc?.discount_pct) || 0))
  const brut = r2(lines.reduce((s, l) => s + lineHt(l), 0))
  const remise = r2((brut * pct) / 100)
  const ht = r2(brut - remise)
  const tva = rate === null ? 0 : r2((ht * rate) / 100)
  return { brut, pct, remise, ht, rate, tva, ttc: r2(ht + tva) }
}

// Prix TTC à partir d'un prix HT (RDV).
export function ttcOf(ht, rate = 20) {
  if (ht === null || ht === undefined || ht === '') return null
  return r2(Number(ht) * (1 + (Number(rate) || 0) / 100))
}

export function htOf(ttc, rate = 20) {
  if (ttc === null || ttc === undefined || ttc === '') return null
  return r2(Number(ttc) / (1 + (Number(rate) || 0) / 100))
}

// « 1 234,56 € » sans espaces insécables fines (compatibles PDF et emails).
export function eur(n) {
  const v = r2(n)
  const neg = v < 0
  const [i, d] = Math.abs(v).toFixed(2).split('.')
  const int = i.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return `${neg ? '- ' : ''}${int},${d} €`
}

export function frDate(iso) {
  if (!iso) return ''
  const [y, m, d] = String(iso).slice(0, 10).split('-')
  return `${d}/${m}/${y}`
}

export function isDraftNumber(number) {
  return !number || String(number).startsWith('BROUILLON-')
}

export function displayNumber(doc) {
  return isDraftNumber(doc?.number) ? 'Brouillon' : doc.number
}

// Nom du client tel qu'il apparaît (entreprise en priorité, comme sur les factures d'Enzo).
export function clientTitle(client = {}) {
  return (client.company || '').trim() || (client.name || '').trim()
}

// Dossier de classement : le nom du client pro, sinon « Particuliers ».
export function folderOf(client = {}) {
  return (client.company || '').trim() || 'Particuliers'
}

export function pdfFileName(doc) {
  const kind = DOC_LABEL[doc.kind] || 'Document'
  return `${kind}-${isDraftNumber(doc.number) ? 'brouillon' : doc.number}.pdf`
}

// Email au client : même texte que les factures envoyées aujourd'hui par Enzo.
export function docEmail(doc, biz = {}) {
  const a = docAmounts(doc)
  const c = doc.client || {}
  const who = clientTitle(c) || 'Madame, Monsieur'
  const kind = doc.kind
  const num = displayNumber(doc)
  const sign = `Enzo de ${biz.name || 'La Clean Compagny'}`
  const subject = `${clientTitle(c) ? `${clientTitle(c)} - ` : ''}${DOC_LABEL[kind]} n° ${num}`
  let main
  if (kind === 'devis') {
    main = `Veuillez trouver ci-joint le **devis n° ${num}** du **${frDate(doc.issued_at)}** d'un montant de **${eur(a.ttc).replace(' €', '')}** euros TTC${
      doc.due_at ? `, valable jusqu'au **${frDate(doc.due_at)}**` : ''
    }.`
  } else if (kind === 'avoir') {
    main = `Veuillez trouver ci-joint l'**avoir n° ${num}** du **${frDate(doc.issued_at)}** d'un montant de **${eur(a.ttc).replace(' €', '')}** euros.`
  } else {
    main = `Veuillez trouver ci-joint la **facture n° ${num}** du **${frDate(doc.issued_at)}** d'un montant de **${eur(a.ttc).replace(' €', '')}** euros due avant le **${frDate(
      doc.due_at || doc.issued_at
    )}**.`
  }
  const paras = [
    `Bonjour **${who}**,`,
    kind === 'devis' ? 'Je vous remercie pour votre demande.' : "Je vous remercie d'avoir fait appel à mes services.",
    main,
    'Je reste à votre disposition pour tous renseignements complémentaires,',
    'Cordialement,',
    sign,
  ]
  const text = paras.map((p) => p.replace(/\*\*/g, '')).join('\n\n')
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#1a1a1a">${paras
    .map((p) => `<p style="margin:0 0 14px">${esc(p).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}</p>`)
    .join('')}</div>`
  return { subject, text, html, paras }
}
