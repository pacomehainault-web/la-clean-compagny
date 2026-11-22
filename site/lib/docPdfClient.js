'use client'

// PDF d'un devis / d'une facture dans le navigateur (aperçu, téléchargement, partage).
import { buildDocPdf } from './invoicePdf.js'
import { pdfFileName } from './invoice.js'

let logoPromise = null

function loadLogo() {
  if (!logoPromise) {
    logoPromise = fetch('/images/logo/logo-facture.jpg')
      .then((r) => (r.ok ? r.arrayBuffer() : null))
      .then((b) => (b ? new Uint8Array(b) : null))
      .catch(() => null)
  }
  return logoPromise
}

// Coordonnées figées à la validation (issuer), complétées par les réglages actuels (IBAN ajouté plus tard…).
export function issuerOf(doc, biz = {}) {
  return doc?.issuer ? { ...biz, ...Object.fromEntries(Object.entries(doc.issuer).filter(([, v]) => v !== '' && v !== null)) } : biz
}

export async function docPdfFile(doc, biz = {}) {
  const bytes = await buildDocPdf(doc, issuerOf(doc, biz), await loadLogo())
  return new File([bytes], pdfFileName(doc), { type: 'application/pdf' })
}

export function downloadFile(file) {
  const url = URL.createObjectURL(file)
  const a = document.createElement('a')
  a.href = url
  a.download = file.name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 60000)
}
