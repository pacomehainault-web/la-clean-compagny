'use client'

import { useEffect, useMemo, useState } from 'react'
import styles from '../admin.module.css'
import d2 from '../docs.module.css'
import { Icon } from './Icon'
import { useMailReady, authHeader } from '../_lib/mail'
import { DOC_STATUS, SERVICES, euros2, formatDate, isOverdue, whatsappHref } from '../_lib/crm'
import { DOC_LABEL, docAmounts, docEmail, displayNumber, isDraftNumber, clientTitle, folderOf, lineHt, eur, pdfFileName } from '@/lib/invoice'

const FILTERS = [
  { id: 'tous', label: 'Tous' },
  { id: 'devis', label: 'Devis' },
  { id: 'facture', label: 'Factures' },
  { id: 'avoir', label: 'Avoirs' },
  { id: 'impayes', label: 'Impayées' },
]
const VAT_CHOICES = [
  { v: '20', label: 'TVA 20 %' },
  { v: '10', label: 'TVA 10 %' },
  { v: '5.5', label: 'TVA 5,5 %' },
  { v: '0', label: 'TVA 0 %' },
  { v: 'none', label: 'Sans TVA (293 B)' },
]
const TERMS = ['immédiat', 'À réception', '30 jours', '45 jours fin de mois']

const folderName = (d) => d.folder || folderOf(d.client)
const isFinal = (d) => d.kind === 'devis' || (d.status !== 'brouillon' && !isDraftNumber(d.number))


// Devis, factures et avoirs : dossiers par client, édition, PDF, envoi par mail.
export default function Documents({ docs, leads, basePath, settings, supabase, flash, onCreate, onUpdate, onDelete, onConvert, onAvoir, onPaid, onOpenLead, openDocId, setOpenDocId }) {
  const [filter, setFilter] = useState('tous')
  const [folder, setFolder] = useState('')
  const [q, setQ] = useState('')
  const [picking, setPicking] = useState(null) // 'devis' | 'facture'
  const mailReady = useMailReady()
  const leadById = useMemo(() => new Map(leads.map((l) => [l.id, l])), [leads])

  // Dossiers : un par client pro (BMW Angers, GR Motors, Cabinet BCM…) + Particuliers.
  const folders = useMemo(() => {
    const m = new Map()
    for (const d of docs) {
      const f = folderName(d)
      m.set(f, (m.get(f) || 0) + 1)
    }
    return [...m.entries()].sort((a, b) => (a[0] === 'Particuliers' ? -1 : b[0] === 'Particuliers' ? 1 : a[0].localeCompare(b[0], 'fr')))
  }, [docs])

  const inFolder = folder ? docs.filter((d) => folderName(d) === folder) : docs
  const list = inFolder
    .filter((d) => {
      if (filter === 'devis') return d.kind === 'devis'
      if (filter === 'facture') return d.kind === 'facture'
      if (filter === 'avoir') return d.kind === 'avoir'
      if (filter === 'impayes') return d.kind === 'facture' && d.status === 'envoye'
      return true
    })
    .filter((d) => {
      if (!q.trim()) return true
      const s = q.trim().toLowerCase()
      return [d.number, d.client?.name, d.client?.company, d.client?.phone, d.client?.plate, ...(d.lines || []).map((l) => l.details)].some(
        (v) => v && String(v).toLowerCase().includes(s)
      )
    })

  const year = String(new Date().getFullYear())
  const invoices = inFolder.filter((d) => d.kind === 'facture' && !['annule', 'brouillon'].includes(d.status))
  const paidYear = invoices.filter((d) => d.status === 'paye' && (d.paid_at || d.issued_at).startsWith(year)).reduce((s, d) => s + Number(d.total), 0)
  const unpaid = invoices.filter((d) => d.status === 'envoye')
  const unpaidTotal = unpaid.reduce((s, d) => s + Number(d.total), 0)
  const late = unpaid.filter((d) => isOverdue(d))
  const openQuotes = inFolder.filter((d) => d.kind === 'devis' && d.status === 'envoye')
  const quotes = inFolder.filter((d) => d.kind === 'devis' && d.status !== 'brouillon' && d.status !== 'annule')
  const acceptRate = quotes.length ? Math.round((quotes.filter((d) => d.status === 'accepte').length / quotes.length) * 100) : null

  const openDoc = docs.find((d) => d.id === openDocId)
  const knownCompanies = folders.map(([f]) => f).filter((f) => f !== 'Particuliers')

  return (
    <div className={styles.stack}>
      <section className={styles.kpis}>
        <div className={styles.kpi}>
          <span>Encaissé {year}</span>
          <strong>{euros2(paidYear)}</strong>
          <em>factures payées (TTC)</em>
        </div>
        <div className={`${styles.kpi} ${late.length ? styles.kpiAlert : ''}`}>
          <span>À encaisser</span>
          <strong>{euros2(unpaidTotal)}</strong>
          <em>
            {unpaid.length} facture{unpaid.length > 1 ? 's' : ''}
            {late.length ? ` · ${late.length} en retard` : ''}
          </em>
        </div>
        <div className={styles.kpi}>
          <span>Devis en attente</span>
          <strong>{openQuotes.length}</strong>
          <em>{euros2(openQuotes.reduce((s, d) => s + Number(d.total), 0))}</em>
        </div>
        <div className={styles.kpi}>
          <span>Devis acceptés</span>
          <strong>{acceptRate === null ? '—' : `${acceptRate} %`}</strong>
          <em>{quotes.length} devis envoyés</em>
        </div>
      </section>

      <div className={styles.toolbar}>
        <button type="button" className={styles.btnPrimary} onClick={() => setPicking('devis')}>
          <Icon name="plus" size={17} /> Devis
        </button>
        <button type="button" className={styles.btnSecondary} onClick={() => setPicking('facture')}>
          <Icon name="plus" size={17} /> Facture
        </button>
        <label className={styles.search}>
          <Icon name="search" size={17} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="N°, client, plaque…" aria-label="Rechercher" />
        </label>
      </div>

      {folders.length > 0 && (
        <div className={d2.folders} role="group" aria-label="Dossiers">
          <button type="button" className={`${d2.folder} ${!folder ? d2.folderOn : ''}`} onClick={() => setFolder('')}>
            Tous les dossiers <em>{docs.length}</em>
          </button>
          {folders.map(([f, n]) => (
            <button type="button" key={f} className={`${d2.folder} ${folder === f ? d2.folderOn : ''}`} onClick={() => setFolder(folder === f ? '' : f)}>
              <Icon name={f === 'Particuliers' ? 'users' : 'building'} size={15} /> {f} <em>{n}</em>
            </button>
          ))}
        </div>
      )}
      {folder && (
        <p className={d2.folderHead}>
          <strong>📁 {folder}</strong>
          <span>
            {inFolder.length} document{inFolder.length > 1 ? 's' : ''}
            {unpaid.length ? ` · ${euros2(unpaidTotal)} à encaisser` : ''}
          </span>
        </p>
      )}

      <div className={styles.chips}>
        {FILTERS.map((f) => (
          <button type="button" key={f.id} className={`${styles.chip} ${filter === f.id ? styles.chipOn : ''}`} onClick={() => setFilter(f.id)}>
            {f.label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <p className={styles.empty}>Aucun document. Créez un devis depuis ici ou depuis la fiche d&apos;un client (bouton « Devis »).</p>
      ) : (
        <div className={styles.table}>
          {list.map((d) => (
            <div className={styles.tRow} key={d.id}>
              <button type="button" className={styles.tMain} onClick={() => setOpenDocId(d.id)}>
                <strong>
                  {displayNumber(d)} · {clientTitle(d.client) || 'Sans client'}
                  {!folder && folderName(d) !== 'Particuliers' && folderName(d) !== clientTitle(d.client) && <span className={d2.tag}>{folderName(d)}</span>}
                </strong>
                <span>
                  {DOC_LABEL[d.kind]} du {formatDate(d.issued_at)}
                  {d.sent_at ? ` · envoyé${d.kind === 'facture' ? 'e' : ''} par mail` : ''}
                </span>
              </button>
              <span className={styles.tCell}>
                {euros2(d.total)}
                <em className={isOverdue(d) ? styles.textDanger : ''}>{isOverdue(d) ? 'En retard' : statusLabel(d)}</em>
              </span>
              <div className={styles.tActs}>
                <PdfButton doc={d} settings={settings} small />
              </div>
            </div>
          ))}
        </div>
      )}

      {picking && (
        <PickClient
          kind={picking}
          leads={leads}
          onClose={() => setPicking(null)}
          onPick={async (lead) => {
            setPicking(null)
            const doc = await onCreate(picking, lead)
            if (doc) setOpenDocId(doc.id)
          }}
        />
      )}

      {openDoc && (
        <DocEditor
          key={openDoc.id}
          doc={openDoc}
          source={openDoc.source_id ? docs.find((x) => x.id === openDoc.source_id) : null}
          avoirOf={openDoc.kind === 'facture' ? docs.find((x) => x.kind === 'avoir' && x.source_id === openDoc.id) : null}
          lead={openDoc.lead_id ? leadById.get(openDoc.lead_id) : null}
          basePath={basePath}
          settings={settings}
          supabase={supabase}
          flash={flash}
          mailReady={mailReady}
          companies={knownCompanies}
          onClose={() => setOpenDocId(null)}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onConvert={onConvert}
          onAvoir={onAvoir}
          onPaid={onPaid}
          onOpenLead={onOpenLead}
          onOpenDoc={setOpenDocId}
        />
      )}
    </div>
  )
}

function statusLabel(d) {
  if (d.kind === 'facture' && d.status === 'envoye') return 'À encaisser'
  if (d.kind === 'facture' && d.status === 'annule') return 'Annulée (avoir)'
  if (d.kind === 'avoir' && d.status !== 'brouillon') return 'Validé'
  return DOC_STATUS[d.status]
}

// Télécharge le PDF (généré dans le téléphone, identique à celui envoyé par mail).
function PdfButton({ doc, settings, small = false, label = 'Télécharger le PDF' }) {
  const [busy, setBusy] = useState(false)
  async function go() {
    setBusy(true)
    try {
      const { docPdfFile, downloadFile } = await import('@/lib/docPdfClient')
      downloadFile(await docPdfFile(doc, settings?.business || {}))
    } catch {
      window.alert('Le PDF n’a pas pu être créé. Réessayez.')
    }
    setBusy(false)
  }
  return small ? (
    <button type="button" className={styles.iconBtn} onClick={go} disabled={busy} aria-label={`PDF ${displayNumber(doc)}`}>
      <Icon name="print" />
    </button>
  ) : (
    <button type="button" className={styles.btnSecondary} onClick={go} disabled={busy}>
      <Icon name="print" size={17} /> {busy ? 'Création…' : label}
    </button>
  )
}

function PickClient({ kind, leads, onPick, onClose }) {
  const [q, setQ] = useState('')
  const list = leads
    .filter((l) => l.source !== 'test')
    .filter((l) => !q.trim() || [l.first_name, l.phone, l.city, l.partner].some((v) => v && v.toLowerCase().includes(q.trim().toLowerCase())))
    .slice(0, 30)
  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Choisir le client">
      <button type="button" className={styles.backdrop} onClick={onClose} aria-label="Fermer" />
      <div className={`${styles.sheet} ${styles.sheetSmall}`}>
        <header className={styles.sheetHead}>
          <div>
            <h2>{kind === 'devis' ? 'Nouveau devis' : 'Nouvelle facture'}</h2>
            <p>Pour quel client ?</p>
          </div>
          <button type="button" className={styles.iconBtn} onClick={onClose} aria-label="Fermer">
            <Icon name="close" />
          </button>
        </header>
        <section className={styles.sheetSection}>
          <label className={styles.search}>
            <Icon name="search" size={17} />
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nom, téléphone, ville…" aria-label="Rechercher un client" />
          </label>
          <ul className={styles.miniList}>
            <li>
              <button type="button" onClick={() => onPick(null)}>
                <span className={styles.miniWhen}>Nouveau</span>
                <strong>Client hors liste</strong>
                <span>particulier ou entreprise, à remplir à la main</span>
              </button>
            </li>
            {list.map((l) => (
              <li key={l.id}>
                <button type="button" onClick={() => onPick(l)}>
                  <span className={styles.miniWhen}>{l.partner || l.city || '—'}</span>
                  <strong>{l.first_name}</strong>
                  <span>{l.service || l.vehicle || ''}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}

function DocEditor({ doc, source, avoirOf, lead, basePath, settings, supabase, flash, mailReady, companies, onClose, onUpdate, onDelete, onConvert, onAvoir, onPaid, onOpenLead, onOpenDoc }) {
  const biz = settings?.business || {}
  const [client, setClient] = useState(doc.client || {})
  const [lines, setLines] = useState(doc.lines?.length ? doc.lines : [{ label: '', details: '', qty: 1, unit_price: 0 }])
  const [discount, setDiscount] = useState(String(Number(doc.discount_pct) || ''))
  const [vat, setVat] = useState(doc.vat_rate === null || doc.vat_rate === undefined ? 'none' : String(Number(doc.vat_rate)))
  const [notes, setNotes] = useState(doc.notes || '')
  const [issued, setIssued] = useState(doc.issued_at)
  const [delivery, setDelivery] = useState(doc.delivery_on || '')
  const [terms, setTerms] = useState(doc.payment_terms || biz.payment_terms || 'immédiat')
  const [due, setDue] = useState(doc.due_at || '')
  const [to, setTo] = useState(doc.client?.email || '')
  const [dirty, setDirty] = useState(false)
  const [confirmDel, setConfirmDel] = useState(false)
  const [confirmFinal, setConfirmFinal] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendMsg, setSendMsg] = useState('')
  const [pdf, setPdf] = useState(null) // fichier PDF prêt (pour le partage en un geste)

  const isQuote = doc.kind === 'devis'
  const final = isFinal(doc)
  const locked = !isQuote && doc.status !== 'brouillon'
  const draft = { ...doc, client, lines, discount_pct: Number(discount) || 0, vat_rate: vat === 'none' ? null : Number(vat), notes: notes.trim() || null, issued_at: issued, delivery_on: delivery || null, payment_terms: terms, due_at: due || null }
  const a = docAmounts(draft)
  const mail = docEmail(draft, biz)

  // PDF préparé à l'avance : le partage (WhatsApp, Mail…) doit partir directement du geste.
  useEffect(() => {
    if (dirty) return
    let alive = true
    import('@/lib/docPdfClient')
      .then(({ docPdfFile }) => docPdfFile(doc, biz))
      .then((f) => alive && setPdf(f))
      .catch(() => {})
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc, dirty])

  const mark = (fn) => (...args) => {
    fn(...args)
    setDirty(true)
  }
  const setLine = mark((i, field, value) => setLines((ls) => ls.map((l, j) => (j === i ? { ...l, [field]: value } : l))))
  const addLine = mark(() => setLines((ls) => [...ls, { label: '', details: '', qty: 1, unit_price: 0 }]))
  const removeLine = mark((i) => setLines((ls) => ls.filter((_, j) => j !== i)))
  const setC = mark((field, value) => setClient((c) => ({ ...c, [field]: value })))

  async function save(extra = {}) {
    const clean = lines
      .filter((l) => (l.label || '').trim() || Number(l.unit_price))
      .map((l) => ({ label: (l.label || '').trim(), details: (l.details || '').trim(), qty: Number(l.qty) || 1, unit_price: Number(l.unit_price) || 0 }))
    const cleanClient = Object.fromEntries(Object.entries(client).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v]))
    const amounts = docAmounts({ ...draft, lines: clean })
    const saved = await onUpdate(doc, {
      client: cleanClient,
      lines: clean,
      discount_pct: amounts.pct,
      vat_rate: amounts.rate,
      total: amounts.ttc,
      total_ht: amounts.ht,
      notes: notes.trim() || null,
      issued_at: issued,
      delivery_on: delivery || null,
      payment_terms: terms || null,
      due_at: due || null,
      folder: folderOf(cleanClient),
      ...extra,
    })
    if (saved) setDirty(false)
    return saved
  }

  // Facture / avoir : numéro définitif + verrouillage.
  async function finalize() {
    setConfirmFinal(false)
    const saved = dirty ? await save({ status: 'envoye' }) : await onUpdate(doc, { status: 'envoye' })
    if (saved) flash?.(`${DOC_LABEL[doc.kind]} n° ${saved.number} validée`)
  }

  async function sendMail() {
    setSendMsg('')
    if (dirty) await save()
    if (isQuote && doc.status === 'brouillon') await onUpdate(doc, { status: 'envoye' }, { silent: true })
    setSending(true)
    try {
      const r = await fetch('/api/docs/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(await authHeader(supabase)) },
        body: JSON.stringify({ id: doc.id, to: to.trim() }),
      })
      const j = await r.json().catch(() => ({}))
      if (r.ok) {
        setSendMsg(`✅ Envoyé à ${to.trim()} (copie dans la boîte d’Enzo).`)
        await onUpdate(doc, { sent_at: j.doc?.sent_at || new Date().toISOString(), sent_to: to.trim() }, { silent: true })
      } else
        setSendMsg(
          j.error === 'gmail_non_configure'
            ? 'L’envoi par mail sera actif dès que le mot de passe Gmail d’Enzo sera ajouté.'
            : j.error === 'email'
              ? 'Adresse email invalide.'
              : j.error === 'a_valider'
                ? 'Validez d’abord la facture.'
                : 'Le mail n’est pas parti. Réessayez dans un instant.'
        )
    } catch {
      setSendMsg('Pas de connexion : le mail n’est pas parti.')
    }
    setSending(false)
  }

  async function sharePdf() {
    if (!pdf) return
    const text = mail.text
    if (navigator.canShare?.({ files: [pdf] })) {
      try {
        await navigator.share({ files: [pdf], title: mail.subject, text })
        if (isQuote && doc.status === 'brouillon') onUpdate(doc, { status: 'envoye' }, { silent: true })
      } catch {}
    } else {
      const { downloadFile } = await import('@/lib/docPdfClient')
      downloadFile(pdf)
      navigator.clipboard?.writeText(text).catch(() => {})
      flash?.('PDF téléchargé, texte du mail copié')
    }
  }

  const waText = `Bonjour ${clientTitle(client)}, voici votre ${DOC_LABEL[doc.kind].toLowerCase()} n° ${displayNumber(doc)} de ${biz.name || 'La Clean Compagny'} d'un montant de ${eur(a.ttc)}${a.rate !== null ? ' TTC' : ''}. ${
    isQuote ? "N'hésitez pas si vous avez une question, je reste disponible pour fixer la date." : 'Merci pour votre confiance !'
  }\nEnzo – La Clean Compagny`

  const steps = isQuote ? ['brouillon', 'envoye', 'accepte', 'refuse'] : []

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label={`${DOC_LABEL[doc.kind]} ${displayNumber(doc)}`}>
      <button type="button" className={styles.backdrop} onClick={onClose} aria-label="Fermer" />
      <div className={styles.sheet}>
        <header className={styles.sheetHead}>
          <div>
            <h2>
              {DOC_LABEL[doc.kind]} {displayNumber(doc)}
            </h2>
            <p>
              {statusLabel(doc)} · {euros2(a.ttc)} {a.rate !== null ? 'TTC' : ''} · 📁 {folderOf(client)}
              {lead ? (
                <>
                  {' · '}
                  <button type="button" className={styles.linkBtn} onClick={() => onOpenLead(lead.id)}>
                    fiche de {lead.first_name}
                  </button>
                </>
              ) : null}
            </p>
          </div>
          <button type="button" className={styles.iconBtn} onClick={onClose} aria-label="Fermer">
            <Icon name="close" />
          </button>
        </header>

        {steps.length > 0 && (
          <div className={styles.steps}>
            {steps.map((s) => (
              <button
                type="button"
                key={s}
                className={`${styles.step} ${doc.status === s ? styles.stepOn : ''}`}
                onClick={async () => {
                  if (dirty) await save()
                  onUpdate(doc, { status: s })
                }}
              >
                {DOC_STATUS[s]}
              </button>
            ))}
          </div>
        )}

        {/* ---------- Validation (factures / avoirs) ---------- */}
        {!isQuote && (
          <section className={styles.sheetSection}>
            {doc.status === 'brouillon' ? (
              <div className={d2.draftBox}>
                <span>
                  Brouillon : vérifiez les lignes puis validez. {doc.kind === 'avoir' ? 'L’avoir' : 'La facture'} prendra le numéro suivant de la série et ne pourra plus être
                  modifié{doc.kind === 'avoir' ? '' : 'e'}.
                </span>
                {confirmFinal ? (
                  <div className={styles.rowBtns}>
                    <button type="button" className={styles.btnSecondary} onClick={() => setConfirmFinal(false)}>
                      Pas encore
                    </button>
                    <button type="button" className={styles.btnPrimary} onClick={finalize}>
                      <Icon name="check" size={17} /> Oui, valider
                    </button>
                  </div>
                ) : (
                  <button type="button" className={`${styles.btnPrimary} ${styles.btnBlock}`} onClick={() => setConfirmFinal(true)} disabled={!a.ttc && doc.kind === 'facture'}>
                    <Icon name="check" size={17} /> Valider {doc.kind === 'avoir' ? 'l’avoir' : 'la facture'}
                  </button>
                )}
              </div>
            ) : (
              <div className={d2.locked}>
                <Icon name="lock" size={17} />
                <span>
                  {doc.kind === 'avoir' ? 'Avoir validé' : 'Facture validée'} n° {doc.number}
                  {doc.sent_at ? ` · envoyée le ${formatDate(doc.sent_at)}${doc.sent_to ? ` à ${doc.sent_to}` : ''}` : ''}
                  {doc.status === 'paye' && doc.paid_at ? ` · payée le ${formatDate(doc.paid_at)}` : ''}
                  {doc.status === 'annule' ? ' · annulée par un avoir' : ''}
                </span>
              </div>
            )}
            {doc.kind === 'facture' && doc.status === 'envoye' && (
              <button type="button" className={`${styles.btnPrimary} ${styles.btnBlock}`} onClick={() => onPaid(doc)} style={{ marginTop: 10 }}>
                <Icon name="euro" size={17} /> Marquer payée
              </button>
            )}
          </section>
        )}

        {/* ---------- Envoi ---------- */}
        <section className={styles.sheetSection}>
          <h3>Envoyer au client</h3>
          {!final ? (
            <p className={styles.hint}>Validez d’abord {doc.kind === 'avoir' ? 'l’avoir' : 'la facture'} : le PDF et le mail partiront avec son numéro définitif.</p>
          ) : (
            <>
              <div className={d2.mail}>
                <div className={d2.mailHead}>
                  <span className={d2.mailSubject}>{mail.subject}</span>
                  <span>
                    De <b>Enzo - {biz.name || 'La Clean Compagny'}</b> à{' '}
                    <input
                      type="email"
                      value={to}
                      onChange={(e) => setTo(e.target.value)}
                      placeholder="email du client"
                      aria-label="Email du client"
                      style={{ border: 0, borderBottom: '1px dashed var(--line2)', background: 'transparent', font: 'inherit', fontWeight: 700, minWidth: 180 }}
                    />
                  </span>
                  <span>Copie cachée à Enzo</span>
                </div>
                <div className={d2.mailBody}>
                  {mail.paras.map((p, i) => (
                    <p key={i} dangerouslySetInnerHTML={{ __html: escapeBold(p) }} />
                  ))}
                </div>
                <button type="button" className={d2.attach} onClick={() => pdf && import('@/lib/docPdfClient').then(({ downloadFile }) => downloadFile(pdf))} disabled={!pdf}>
                  <i>PDF</i> {pdfFileName(doc)}
                </button>
              </div>
              <div className={d2.sendGrid} style={{ marginTop: 10 }}>
                <button type="button" className={styles.btnPrimary} onClick={sendMail} disabled={!mailReady || sending || !to.trim()}>
                  <Icon name="mail" size={17} /> {sending ? 'Envoi…' : doc.sent_at ? 'Renvoyer par mail' : 'Envoyer par mail'}
                </button>
                <button type="button" className={styles.btnSecondary} onClick={sharePdf} disabled={!pdf || dirty}>
                  <Icon name="share" size={17} /> Partager le PDF
                </button>
                {client.phone && (
                  <a className={styles.actWa} href={whatsappHref({ phone: client.phone }, waText)} target="_blank" rel="noopener noreferrer">
                    <Icon name="whatsapp" size={17} /> Message WhatsApp
                  </a>
                )}
                <PdfButton doc={doc} settings={settings} label="Télécharger" />
                <a className={styles.btnSecondary} href={`${basePath}/doc/${doc.id}`} target="_blank" rel="noopener noreferrer">
                  <Icon name="eye" size={17} /> Aperçu
                </a>
              </div>
              {mailReady === false && (
                <p className={styles.hint}>
                  📩 Envoi direct par mail : actif dès que le mot de passe d’application Gmail d’Enzo est ajouté. En attendant, « Partager le PDF » ouvre Mail ou WhatsApp avec le
                  PDF déjà joint.
                </p>
              )}
              {sendMsg && <p className={styles.hint}>{sendMsg}</p>}
            </>
          )}
          {isQuote && doc.status !== 'refuse' && (
            <button type="button" className={styles.btnSecondary} onClick={() => onConvert(doc)}>
              <Icon name="file" size={17} /> Transformer en facture
            </button>
          )}
          {doc.kind === 'facture' && locked && doc.status !== 'annule' && !avoirOf && (
            <button type="button" className={styles.linkBtn} onClick={() => onAvoir(doc)}>
              Erreur sur la facture ? Faire un avoir pour l’annuler
            </button>
          )}
          {avoirOf && (
            <button type="button" className={styles.linkBtn} onClick={() => onOpenDoc(avoirOf.id)}>
              Voir l’avoir {displayNumber(avoirOf)}
            </button>
          )}
          {source && (
            <button type="button" className={styles.linkBtn} onClick={() => onOpenDoc(source.id)}>
              {DOC_LABEL[source.kind]} d’origine : {displayNumber(source)}
            </button>
          )}
        </section>

        {/* ---------- Client ---------- */}
        <section className={styles.sheetSection}>
          <h3>Client</h3>
          <label className={styles.field}>
            Entreprise (client pro → son propre dossier)
            <input list="doc-companies" value={client.company || ''} onChange={(e) => setC('company', e.target.value)} disabled={locked} placeholder="Vide = particulier" />
          </label>
          <datalist id="doc-companies">
            {companies.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          <div className={styles.grid2}>
            <label className={styles.field}>
              {client.company ? 'À l’attention de' : 'Nom'}
              <input value={client.name || ''} onChange={(e) => setC('name', e.target.value)} disabled={locked} placeholder={client.company && !locked ? 'M Laurent Chevalier' : ''} />
            </label>
            <label className={styles.field}>
              Téléphone
              <input type="tel" value={client.phone || ''} onChange={(e) => setC('phone', e.target.value)} disabled={locked} />
            </label>
            <label className={styles.field}>
              Email
              <input
                type="email"
                value={client.email || ''}
                onChange={(e) => {
                  setC('email', e.target.value)
                  setTo(e.target.value)
                }}
                disabled={locked}
              />
            </label>
            <label className={styles.field}>
              Véhicule
              <input value={client.vehicle || ''} onChange={(e) => setC('vehicle', e.target.value)} disabled={locked} />
            </label>
          </div>
          <label className={styles.field}>
            Adresse de facturation
            <textarea rows={2} value={client.address || ''} onChange={(e) => setC('address', e.target.value)} disabled={locked} placeholder={locked ? '' : '4, Rue René Rouchy\n49100 Angers'} />
          </label>
        </section>

        {/* ---------- Prestations ---------- */}
        <section className={styles.sheetSection}>
          <h3>Prestations (prix HT)</h3>
          <div className={styles.lines}>
            {lines.map((l, i) => (
              <div className={d2.dline} key={i}>
                <input list="doc-services" value={l.label} onChange={(e) => setLine(i, 'label', e.target.value)} placeholder="Prestation" aria-label="Prestation" disabled={locked} />
                <input type="number" min="0" step="1" inputMode="decimal" value={l.qty} onChange={(e) => setLine(i, 'qty', e.target.value)} aria-label="Quantité" disabled={locked} />
                <input
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  value={l.unit_price}
                  onChange={(e) => setLine(i, 'unit_price', e.target.value)}
                  aria-label="Prix unitaire HT en euros"
                  disabled={locked}
                />
                {!locked ? (
                  <button type="button" className={styles.iconBtnSm} onClick={() => removeLine(i)} aria-label="Retirer la ligne">
                    <Icon name="trash" size={15} />
                  </button>
                ) : (
                  <span />
                )}
                <textarea
                  rows={2}
                  value={l.details || ''}
                  onChange={(e) => setLine(i, 'details', e.target.value)}
                  placeholder={locked ? '' : 'Détail (gris sous la ligne) : véhicule, immatriculation, date…'}
                  aria-label="Détail de la prestation"
                  disabled={locked}
                />
                <small>
                  {eur(lineHt(l))} HT{a.rate !== null ? <> · <b>{eur(lineHt(l) * (1 + a.rate / 100))} TTC</b></> : null}
                </small>
              </div>
            ))}
          </div>
          <datalist id="doc-services">
            {SERVICES.map((s) => (
              <option key={s} value={s} />
            ))}
            <option value="Forfait nettoyage intérieur extérieur premium" />
            <option value="Déplacement" />
            <option value="Supplément poils d'animaux" />
          </datalist>
          {!locked && (
            <button type="button" className={styles.linkBtn} onClick={addLine}>
              + Ajouter une ligne
            </button>
          )}
          <div className={d2.grid3}>
            <label className={styles.field}>
              Remise (%)
              <input type="number" min="0" max="100" step="0.5" inputMode="decimal" value={discount} onChange={mark((e) => setDiscount(e.target.value))} disabled={locked} placeholder="0" />
            </label>
            <label className={styles.field}>
              TVA
              <select value={vat} onChange={mark((e) => setVat(e.target.value))} disabled={locked}>
                {VAT_CHOICES.map((v) => (
                  <option key={v.v} value={v.v}>
                    {v.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className={d2.totals}>
            {a.rate !== null || a.pct ? (
              <div>
                <span>Total brut HT</span>
                <strong>{eur(a.brut)}</strong>
              </div>
            ) : null}
            {a.pct ? (
              <div>
                <span>Remise ({String(a.pct).replace('.', ',')} %)</span>
                <strong>{eur(-a.remise)}</strong>
              </div>
            ) : null}
            {a.rate !== null && (
              <>
                <div>
                  <span>Total HT</span>
                  <strong>{eur(a.ht)}</strong>
                </div>
                <div>
                  <span>TVA {String(a.rate).replace('.', ',')} %</span>
                  <strong>{eur(a.tva)}</strong>
                </div>
              </>
            )}
            <div className={d2.ttc}>
              <span>{a.rate !== null ? 'Total TTC' : 'Total (TVA non applicable)'}</span>
              <strong>{eur(a.ttc)}</strong>
            </div>
          </div>
        </section>

        {/* ---------- Dates ---------- */}
        <section className={styles.sheetSection}>
          <h3>Dates et conditions</h3>
          <div className={styles.grid2}>
            <label className={styles.field}>
              {isQuote ? 'Date du devis' : 'Date de facture'}
              <input type="date" value={issued} onChange={mark((e) => setIssued(e.target.value))} disabled={locked || !isQuote} />
            </label>
            <label className={styles.field}>
              Date de prestation (livraison)
              <input type="date" value={delivery} onChange={mark((e) => setDelivery(e.target.value))} disabled={locked} />
            </label>
            <label className={styles.field}>
              Conditions de règlement
              <input list="doc-terms" value={terms} onChange={mark((e) => setTerms(e.target.value))} disabled={locked} />
            </label>
            <label className={styles.field}>
              {isQuote ? 'Valable jusqu’au' : 'Échéance de paiement'}
              <input type="date" value={due} onChange={mark((e) => setDue(e.target.value))} disabled={locked} />
            </label>
          </div>
          <datalist id="doc-terms">
            {TERMS.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
          {!isQuote && doc.status === 'brouillon' && <p className={styles.hint}>La date de facture est fixée automatiquement au jour de la validation.</p>}
          <label className={styles.field}>
            Notes (visibles sur le document)
            <textarea rows={3} value={notes} onChange={mark((e) => setNotes(e.target.value))} disabled={locked} />
          </label>
        </section>

        {dirty && (
          <div className={styles.saveBarFixed}>
            <span>Modifications non enregistrées</span>
            <button type="button" className={styles.btnPrimary} onClick={() => save()}>
              Enregistrer
            </button>
          </div>
        )}

        <footer className={styles.sheetFoot}>
          {confirmDel ? (
            <>
              <span>Supprimer {displayNumber(doc)} ?</span>
              <button type="button" className={styles.btnSecondary} onClick={() => setConfirmDel(false)}>
                Non
              </button>
              <button type="button" className={styles.btnDanger} onClick={() => onDelete(doc)}>
                Oui, supprimer
              </button>
            </>
          ) : locked ? (
            <span className={styles.hint}>Une facture validée ne se supprime pas : pour l’annuler, faites un avoir.</span>
          ) : (
            <button type="button" className={styles.linkDanger} onClick={() => setConfirmDel(true)}>
              <Icon name="trash" size={15} /> Supprimer
            </button>
          )}
        </footer>
      </div>
    </div>
  )
}

function escapeBold(p) {
  return p
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
}
