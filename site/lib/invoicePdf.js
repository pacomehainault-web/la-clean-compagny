// PDF des devis / factures / avoirs, au même format que les factures envoyées par Enzo.
// Fonctionne dans le navigateur (aperçu, partage) et sur le serveur (envoi par email).
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { DOC_LABEL, docAmounts, eur, frDate, lineHt, displayNumber, clientTitle } from './invoice.js'

const A4 = [595.28, 841.89]
const M = 40 // marge
const RIGHT = A4[0] - M
const INK = rgb(0.11, 0.12, 0.14)
const GREY = rgb(0.45, 0.47, 0.5)
const LIGHT = rgb(0.86, 0.87, 0.89)
const BAND = rgb(0.95, 0.95, 0.96)

// Les polices standard du PDF ne savent écrire que l'alphabet « WinAnsi » : on remplace le reste.
const EXTRA = '€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ'
function clean(s) {
  return String(s ?? '')
    .replace(/[   ]/g, ' ')
    .replace(/[‐‑‒]/g, '-')
    .replace(/\r/g, '')
    .split('')
    .filter((ch) => ch === '\n' || (ch >= ' ' && ch <= 'ÿ' && !(ch >= '\u007F' && ch < ' ')) || EXTRA.includes(ch))
    .join('')
}

function wrap(text, font, size, width) {
  const out = []
  for (const para of clean(text).split('\n')) {
    const words = para.split(/ +/)
    let line = ''
    for (const w of words) {
      const test = line ? `${line} ${w}` : w
      if (font.widthOfTextAtSize(test, size) <= width || !line) line = test
      else {
        out.push(line)
        line = w
      }
    }
    out.push(line)
  }
  return out
}

export async function buildDocPdf(doc, biz = {}, logoBytes = null) {
  const pdf = await PDFDocument.create()
  const label = DOC_LABEL[doc.kind] || 'Document'
  pdf.setTitle(`${label} ${displayNumber(doc)}`)
  pdf.setAuthor(biz.name || 'La Clean Compagny')
  const f = await pdf.embedFont(StandardFonts.Helvetica)
  const fb = await pdf.embedFont(StandardFonts.HelveticaBold)
  let logo = null
  if (logoBytes) {
    try {
      logo = await pdf.embedJpg(logoBytes)
    } catch {
      try {
        logo = await pdf.embedPng(logoBytes)
      } catch {}
    }
  }

  const pages = []
  let page
  const newPage = () => {
    page = pdf.addPage(A4)
    pages.push(page)
    return A4[1] - M
  }

  const text = (s, x, y, { size = 8, font = f, color = INK, align = 'left' } = {}) => {
    const t = clean(s)
    const w = font.widthOfTextAtSize(t, size)
    const xx = align === 'right' ? x - w : align === 'center' ? x - w / 2 : x
    page.drawText(t, { x: xx, y, size, font, color })
  }
  const hr = (y, x1 = M, x2 = RIGHT, color = LIGHT, thickness = 0.6) => page.drawLine({ start: { x: x1, y }, end: { x: x2, y }, thickness, color })

  const a = docAmounts(doc)
  const c = doc.client || {}
  const isQuote = doc.kind === 'devis'
  const withVat = a.rate !== null

  // ---------- En-tête : logo + entreprise ----------
  let y = newPage()
  const logoW = 78
  const logoH = logo ? (logo.height / logo.width) * logoW : 0
  if (logo) page.drawImage(logo, { x: M, y: y - logoH, width: logoW, height: logoH })
  const bx = M + (logo ? logoW + 16 : 0)
  let by = y - 8
  const bizLines = [
    [biz.owner_label || (biz.owner ? biz.owner.split(' ').reverse().join(' ') : biz.name || 'La Clean Compagny'), fb],
    [biz.legal_name || biz.name, f],
    [biz.address, f],
    [[biz.phone, biz.email].filter(Boolean).join('  |  '), f],
  ]
  for (const [s, font] of bizLines) {
    if (!s) continue
    text(s, bx, by, { size: 8, font })
    by -= 11
  }
  by -= 3
  if (biz.siret) {
    text('SIRET:', bx, by, { size: 7.5, color: GREY })
    text(biz.siret, bx + 30, by, { size: 7.5 })
    by -= 10
  }
  if (withVat && biz.vat_number) {
    text('TVA:', bx, by, { size: 7.5, color: GREY })
    text(biz.vat_number, bx + 30, by, { size: 7.5 })
    by -= 10
  }
  y = Math.min(by, y - logoH) - 26

  // ---------- Titre ----------
  text(label, M, y, { size: 13, font: fb })
  text(`#${displayNumber(doc)}`, RIGHT, y, { size: 9.5, font: fb, align: 'right' })
  y -= 26

  // ---------- Adresse de facturation ----------
  const cx = 330
  text(isQuote ? 'Destinataire' : 'Adresse de facturation', cx, y, { size: 7, color: GREY })
  y -= 13
  const title = clientTitle(c)
  if (title) {
    for (const l of wrap(title.toUpperCase() === title ? title : title, fb, 9, RIGHT - cx)) {
      text(l, cx, y, { size: 9, font: c.company ? f : f })
      y -= 12
    }
  }
  if (c.company && c.name) {
    text(`A l'attention de ${c.name}`, cx, y, { size: 8.5 })
    y -= 12
  }
  for (const part of String(c.address || '')
    .split(/\n|,(?=\s*\d{5})/)
    .map((s) => s.trim())
    .filter(Boolean)) {
    for (const l of wrap(part, f, 8.5, RIGHT - cx)) {
      text(l, cx, y, { size: 8.5 })
      y -= 12
    }
  }
  const contact = []
  if (c.phone) contact.push(['TEL:', c.phone])
  if (c.email) contact.push(['EMAIL:', c.email])
  if (contact.length) {
    let x = cx
    y -= 2
    for (const [k, v] of contact) {
      text(k, x, y, { size: 6.5, color: GREY })
      x += f.widthOfTextAtSize(k, 6.5) + 3
      text(v, x, y, { size: 7 })
      x += f.widthOfTextAtSize(clean(v), 7) + 10
    }
    y -= 12
  }
  y -= 16

  // ---------- Dates ----------
  const cols = [
    [isQuote ? 'Date du devis' : label === 'Avoir' ? "Date de l'avoir" : 'Date de facture', frDate(doc.issued_at)],
    ['Date de livraison', frDate(doc.delivery_on)],
    ['Conditions de règlement', doc.payment_terms || biz.payment_terms || 'immédiat'],
    [isQuote ? 'Valable jusqu’au' : 'Échéance de paiement', frDate(doc.due_at)],
  ]
  const colX = [M, 200, 352, 470]
  cols.forEach(([k, v], i) => {
    text(k, colX[i], y, { size: 7, color: GREY })
    text(v || '—', colX[i], y - 13, { size: 9.5 })
  })
  y -= 34

  // ---------- Tableau ----------
  const X = { n: M, art: M + 22, qty: 258, pu: 352, mht: 425, tva: 478, ttc: RIGHT }
  const tableHead = (yy) => {
    page.drawRectangle({ x: M - 4, y: yy - 6, width: RIGHT - M + 8, height: 17, color: BAND })
    const h = { size: 6.5, color: GREY }
    text('N°', X.n, yy, h)
    text('ARTICLE', X.art, yy, h)
    text('QUANTITÉ', X.qty, yy, { ...h, align: 'right' })
    text(withVat ? 'PRIX UNITÉ HT' : 'PRIX UNITAIRE', X.pu, yy, { ...h, align: 'right' })
    text(withVat ? 'MONTANT HT' : 'MONTANT', X.mht, yy, { ...h, align: 'right' })
    if (withVat) {
      text('TVA', X.tva, yy, { ...h, align: 'right' })
      text('TOTAL TTC', X.ttc, yy, { ...h, align: 'right' })
    }
    return yy - 22
  }
  y = tableHead(y)
  const FOOTER_SPACE = 70
  const lines = (doc.lines || []).filter((l) => (l.label || '').trim() || Number(l.unit_price))
  lines.forEach((l, i) => {
    const lab = wrap(String(l.label || '').toUpperCase(), fb, 7.5, X.qty - X.art - 40)
    const det = l.details ? wrap(l.details, f, 7, X.qty - X.art - 40) : []
    const h = lab.length * 10 + det.length * 9 + 10
    if (y - h < FOOTER_SPACE) {
      y = tableHead(newPage())
    }
    const ht = lineHt(l)
    text(String(i + 1), X.n, y, { size: 7.5 })
    let ly = y
    for (const s of lab) {
      text(s, X.art, ly, { size: 7.5, font: fb })
      ly -= 10
    }
    for (const s of det) {
      text(s, X.art, ly, { size: 7, color: GREY })
      ly -= 9
    }
    const q = Number(l.qty) || 0
    text(String(q).replace('.', ','), X.qty, y, { size: 7.5, align: 'right' })
    text(eur(l.unit_price), X.pu, y, { size: 7.5, align: 'right' })
    text(eur(ht), X.mht, y, { size: 7.5, align: 'right' })
    if (withVat) {
      text(`${a.rate.toFixed(2).replace('.', ',')} %`, X.tva, y, { size: 7.5, align: 'right' })
      text(eur(ht * (1 + a.rate / 100)), X.ttc, y, { size: 7.5, align: 'right' })
    }
    y -= h
  })

  // ---------- Totaux ----------
  const totalsH = (withVat ? 5 : 2) * 13 + (a.pct ? 13 : 0) + 30
  const bottomH = isQuote ? 110 : 150
  if (y - totalsH < M + bottomH + 20) y = newPage() - 10
  y -= 14
  const tx = 330
  const row = (k, v, { bold = false, size = 8, color = INK, extra = null } = {}) => {
    text(k, tx, y, { size, font: bold ? fb : f, color })
    if (extra) text(extra, 470, y, { size: size - 0.5, color: GREY, align: 'right' })
    text(v, RIGHT, y, { size, font: bold ? fb : f, color, align: 'right' })
    y -= 13
  }
  if (withVat) {
    row('Total brut HT', eur(a.brut))
    if (a.pct) row(`Remise (${a.pct.toFixed(2).replace('.', ',')} %)`, eur(-a.remise))
    row('Total HT', eur(a.ht))
    row('Total TVA', eur(a.tva))
    text(`Dont TVA ${a.rate.toFixed(2).replace('.', ',')} %`, tx + 12, y + 2, { size: 6.5, color: GREY })
    text(`${eur(a.ht)} HT`, 470, y + 2, { size: 6.5, color: GREY, align: 'right' })
    text(eur(a.tva), RIGHT, y + 2, { size: 6.5, color: GREY, align: 'right' })
    y -= 16
    hr(y + 10, tx, RIGHT)
    row(label === 'Avoir' ? 'Total TTC de l’avoir' : 'Total TTC', eur(a.ttc), { bold: true, size: 9 })
  } else {
    if (a.pct) {
      row('Total brut', eur(a.brut))
      row(`Remise (${a.pct.toFixed(2).replace('.', ',')} %)`, eur(-a.remise))
    }
    row('Total à payer', eur(a.ttc), { bold: true, size: 9 })
    text(biz.vat_note || 'TVA non applicable, art. 293 B du CGI', RIGHT, y, { size: 6.5, color: GREY, align: 'right' })
    y -= 13
  }

  // Notes (visibles sur le document)
  if (doc.notes) {
    y -= 6
    for (const l of wrap(doc.notes, f, 7.5, 270)) {
      if (y < M + bottomH + 10) break
      text(l, M, y, { size: 7.5, color: GREY })
      y -= 10
    }
  }

  // ---------- Bas de page : paiement / accord + mentions ----------
  let fy = M + 120
  if (isQuote) {
    text('Bon pour accord (date, signature et mention « Bon pour accord ») :', M, fy, { size: 7.5, color: GREY })
    page.drawRectangle({ x: M, y: fy - 62, width: 230, height: 52, borderColor: LIGHT, borderWidth: 0.8 })
  } else {
    if (doc.status === 'paye' && doc.paid_at) {
      text(`Payée le ${frDate(doc.paid_at)}`, M, fy + 18, { size: 8.5, font: fb, color: rgb(0.1, 0.5, 0.25) })
    }
    if (biz.iban) {
      text('Paiement souhaité par virement bancaire', M, fy, { size: 7, color: GREY })
      fy -= 11
      const pc = [
        ['Nom associé au compte', biz.account_holder || (biz.owner ? biz.owner.split(' ').reverse().join(' ') : '')],
        ['IBAN', biz.iban],
        ['BIC', biz.bic],
        ['Nom de la banque', biz.bank],
      ]
      const px = [M, 200, 352, 470]
      pc.forEach(([k, v], i) => {
        text(k, px[i], fy, { size: 7, font: fb })
        wrap(v || '', f, 7.5, i === 1 ? 148 : 110).forEach((s, j) => text(s, px[i], fy - 11 - j * 10, { size: 7.5 }))
      })
      fy -= 44
    } else fy -= 30
    const legal =
      'Pour tout professionnel, en cas de retard de paiement, seront exigibles, conformément à l’article L. 441-10 du code de commerce, une indemnité calculée sur la base de trois fois le taux de l’intérêt légal en vigueur ainsi qu’une indemnité forfaitaire pour frais de recouvrement de 40 euros. Pas d’escompte pour règlement anticipé.'
    wrap(legal, f, 6.5, RIGHT - M).forEach((s, j) => text(s, M, fy - j * 9, { size: 6.5, color: GREY }))
  }

  // Pied de page sur chaque page
  pages.forEach((p, i) => {
    page = p
    text(biz.rm || '', M, M - 14, { size: 6, color: GREY })
    text(`Page ${i + 1} / ${pages.length}`, RIGHT, M - 14, { size: 6, color: GREY, align: 'right' })
  })

  return pdf.save()
}
