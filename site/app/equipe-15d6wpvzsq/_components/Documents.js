'use client'

import { useMemo, useState } from 'react'
import styles from '../admin.module.css'
import { Icon } from './Icon'
import { DOC_STATUS, SERVICES, docTotal, euros2, formatDate, isOverdue, lineTotal, whatsappHref, gmailHref } from '../_lib/crm'

const FILTERS = [
  { id: 'tous', label: 'Tous' },
  { id: 'devis', label: 'Devis' },
  { id: 'facture', label: 'Factures' },
  { id: 'impayes', label: 'Impayées' },
]

// Devis et factures : liste, création, édition, impression en PDF.
export default function Documents({ docs, leads, basePath, onCreate, onUpdate, onDelete, onConvert, onPaid, onOpenLead, openDocId, setOpenDocId }) {
  const [filter, setFilter] = useState('tous')
  const [q, setQ] = useState('')
  const [picking, setPicking] = useState(null) // 'devis' | 'facture'
  const leadById = useMemo(() => new Map(leads.map((l) => [l.id, l])), [leads])

  const list = docs
    .filter((d) => {
      if (filter === 'devis') return d.kind === 'devis'
      if (filter === 'facture') return d.kind === 'facture'
      if (filter === 'impayes') return d.kind === 'facture' && d.status === 'envoye'
      return true
    })
    .filter((d) => {
      if (!q.trim()) return true
      const s = q.trim().toLowerCase()
      return [d.number, d.client?.name, d.client?.phone].some((v) => v && String(v).toLowerCase().includes(s))
    })

  const year = String(new Date().getFullYear())
  const invoices = docs.filter((d) => d.kind === 'facture' && d.status !== 'annule')
  const paidYear = invoices.filter((d) => d.status === 'paye' && (d.paid_at || d.issued_at).startsWith(year)).reduce((s, d) => s + Number(d.total), 0)
  const unpaid = invoices.filter((d) => d.status === 'envoye')
  const unpaidTotal = unpaid.reduce((s, d) => s + Number(d.total), 0)
  const late = unpaid.filter((d) => isOverdue(d))
  const openQuotes = docs.filter((d) => d.kind === 'devis' && d.status === 'envoye')
  const quotes = docs.filter((d) => d.kind === 'devis' && d.status !== 'brouillon' && d.status !== 'annule')
  const acceptRate = quotes.length ? Math.round((quotes.filter((d) => d.status === 'accepte').length / quotes.length) * 100) : null

  const openDoc = docs.find((d) => d.id === openDocId)

  return (
    <div className={styles.stack}>
      <section className={styles.kpis}>
        <div className={styles.kpi}>
          <span>Encaissé {year}</span>
          <strong>{euros2(paidYear)}</strong>
          <em>factures payées</em>
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
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="N°, client, téléphone…" aria-label="Rechercher" />
        </label>
      </div>
      <div className={styles.chips}>
        {FILTERS.map((f) => (
          <button type="button" key={f.id} className={`${styles.chip} ${filter === f.id ? styles.chipOn : ''}`} onClick={() => setFilter(f.id)}>
            {f.label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <p className={styles.empty}>
          Aucun document. Créez un devis depuis ici ou depuis la fiche d&apos;un prospect (bouton « Devis »).
        </p>
      ) : (
        <div className={styles.table}>
          {list.map((d) => (
            <div className={styles.tRow} key={d.id}>
              <button type="button" className={styles.tMain} onClick={() => setOpenDocId(d.id)}>
                <strong>
                  {d.number} · {d.client?.name || 'Sans client'}
                </strong>
                <span>
                  {d.kind === 'devis' ? 'Devis' : 'Facture'} du {formatDate(d.issued_at)}
                </span>
              </button>
              <span className={styles.tCell}>
                {euros2(d.total)}
                <em className={isOverdue(d) ? styles.textDanger : ''}>{isOverdue(d) ? 'En retard' : DOC_STATUS[d.status]}</em>
              </span>
              <div className={styles.tActs}>
                <a className={styles.iconBtn} href={`${basePath}/doc/${d.id}`} target="_blank" rel="noopener noreferrer" aria-label={`Imprimer ${d.number}`}>
                  <Icon name="print" />
                </a>
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
          lead={openDoc.lead_id ? leadById.get(openDoc.lead_id) : null}
          basePath={basePath}
          onClose={() => setOpenDocId(null)}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onConvert={onConvert}
          onPaid={onPaid}
          onOpenLead={onOpenLead}
        />
      )}
    </div>
  )
}

function PickClient({ kind, leads, onPick, onClose }) {
  const [q, setQ] = useState('')
  const list = leads
    .filter((l) => l.source !== 'test')
    .filter((l) => !q.trim() || [l.first_name, l.phone, l.city].some((v) => v && v.toLowerCase().includes(q.trim().toLowerCase())))
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
                <span>à remplir à la main</span>
              </button>
            </li>
            {list.map((l) => (
              <li key={l.id}>
                <button type="button" onClick={() => onPick(l)}>
                  <span className={styles.miniWhen}>{l.city || '—'}</span>
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

function DocEditor({ doc, lead, basePath, onClose, onUpdate, onDelete, onConvert, onPaid, onOpenLead }) {
  const [client, setClient] = useState(doc.client || {})
  const [lines, setLines] = useState(doc.lines?.length ? doc.lines : [{ label: '', qty: 1, unit_price: 0 }])
  const [notes, setNotes] = useState(doc.notes || '')
  const [issued, setIssued] = useState(doc.issued_at)
  const [due, setDue] = useState(doc.due_at || '')
  const [dirty, setDirty] = useState(false)
  const [confirmDel, setConfirmDel] = useState(false)
  const total = docTotal(lines)
  const locked = doc.kind === 'facture' && ['paye', 'annule'].includes(doc.status)

  const mark = (fn) => (...a) => {
    fn(...a)
    setDirty(true)
  }
  const setLine = mark((i, field, value) => setLines((ls) => ls.map((l, j) => (j === i ? { ...l, [field]: value } : l))))
  const addLine = mark((label = '', price = 0) => setLines((ls) => [...ls, { label, qty: 1, unit_price: price }]))
  const removeLine = mark((i) => setLines((ls) => ls.filter((_, j) => j !== i)))
  const setC = mark((field, value) => setClient((c) => ({ ...c, [field]: value })))

  async function save(extra = {}) {
    const clean = lines.filter((l) => l.label.trim() || Number(l.unit_price))
    const ok = await onUpdate(doc, {
      client,
      lines: clean.map((l) => ({ label: l.label.trim(), qty: Number(l.qty) || 1, unit_price: Number(l.unit_price) || 0 })),
      total: docTotal(clean),
      notes: notes.trim() || null,
      issued_at: issued,
      due_at: due || null,
      ...extra,
    })
    if (ok) setDirty(false)
    return ok
  }

  const label = doc.kind === 'devis' ? 'devis' : 'facture'
  const message = `Bonjour ${client.name || ''}, voici votre ${label} n° ${doc.number} de La Clean Compagny pour un montant de ${euros2(total)}. ${
    doc.kind === 'devis' ? "N'hésitez pas si vous avez une question, je reste disponible pour fixer la date." : 'Merci pour votre confiance !'
  }\nEnzo – La Clean Compagny`

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label={`${doc.number}`}>
      <button type="button" className={styles.backdrop} onClick={onClose} aria-label="Fermer" />
      <div className={styles.sheet}>
        <header className={styles.sheetHead}>
          <div>
            <h2>
              {doc.kind === 'devis' ? 'Devis' : 'Facture'} {doc.number}
            </h2>
            <p>
              {DOC_STATUS[doc.status]} · {euros2(total)}
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

        <div className={styles.steps}>
          {(doc.kind === 'devis' ? ['brouillon', 'envoye', 'accepte', 'refuse'] : ['brouillon', 'envoye', 'paye', 'annule']).map((s) => (
            <button
              type="button"
              key={s}
              className={`${styles.step} ${doc.status === s ? styles.stepOn : ''}`}
              onClick={async () => {
                if (dirty) await save()
                if (s === 'paye') onPaid(doc)
                else onUpdate(doc, { status: s })
              }}
            >
              {DOC_STATUS[s]}
            </button>
          ))}
        </div>

        <section className={styles.sheetSection}>
          <h3>Envoyer</h3>
          <div className={styles.quickRow}>
            <a
              className={styles.btnPrimary}
              href={`${basePath}/doc/${doc.id}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={async () => dirty && (await save())}
            >
              <Icon name="print" size={17} /> PDF / imprimer
            </a>
            {client.phone && (
              <a
                className={styles.actWa}
                href={whatsappHref({ phone: client.phone }, message)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => doc.status === 'brouillon' && onUpdate(doc, { status: 'envoye' }, { silent: true })}
              >
                <Icon name="whatsapp" size={17} /> WhatsApp
              </a>
            )}
            {client.email && (
              <a
                className={styles.btnSecondary}
                href={gmailHref({ email: client.email }, `Votre ${label} ${doc.number} – La Clean Compagny`, message)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => doc.status === 'brouillon' && onUpdate(doc, { status: 'envoye' }, { silent: true })}
              >
                <Icon name="mail" size={17} /> Gmail
              </a>
            )}
          </div>
          <p className={styles.hint}>
            Ouvrez le PDF, enregistrez-le (Partager → Enregistrer dans Fichiers sur iPhone), puis joignez-le au message.
          </p>
          {doc.kind === 'devis' && doc.status !== 'refuse' && (
            <button type="button" className={styles.btnSecondary} onClick={() => onConvert(doc)}>
              <Icon name="file" size={17} /> Transformer en facture
            </button>
          )}
        </section>

        <section className={styles.sheetSection}>
          <h3>Client</h3>
          <div className={styles.grid2}>
            <label className={styles.field}>
              Nom
              <input value={client.name || ''} onChange={(e) => setC('name', e.target.value)} disabled={locked} />
            </label>
            <label className={styles.field}>
              Téléphone
              <input type="tel" value={client.phone || ''} onChange={(e) => setC('phone', e.target.value)} disabled={locked} />
            </label>
            <label className={styles.field}>
              Email
              <input type="email" value={client.email || ''} onChange={(e) => setC('email', e.target.value)} disabled={locked} />
            </label>
            <label className={styles.field}>
              Véhicule
              <input value={client.vehicle || ''} onChange={(e) => setC('vehicle', e.target.value)} disabled={locked} />
            </label>
          </div>
          <label className={styles.field}>
            Adresse
            <input value={client.address || ''} onChange={(e) => setC('address', e.target.value)} disabled={locked} />
          </label>
          <label className={styles.field}>
            Entreprise / SIRET (clients pros)
            <input value={client.company || ''} onChange={(e) => setC('company', e.target.value)} disabled={locked} />
          </label>
        </section>

        <section className={styles.sheetSection}>
          <h3>Prestations</h3>
          <div className={styles.lines}>
            {lines.map((l, i) => (
              <div className={styles.line} key={i}>
                <input
                  list="doc-services"
                  value={l.label}
                  onChange={(e) => setLine(i, 'label', e.target.value)}
                  placeholder="Prestation"
                  aria-label="Prestation"
                  disabled={locked}
                />
                <input
                  type="number"
                  min="0"
                  step="1"
                  inputMode="decimal"
                  value={l.qty}
                  onChange={(e) => setLine(i, 'qty', e.target.value)}
                  aria-label="Quantité"
                  disabled={locked}
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  value={l.unit_price}
                  onChange={(e) => setLine(i, 'unit_price', e.target.value)}
                  aria-label="Prix unitaire en euros"
                  disabled={locked}
                />
                <em>{euros2(lineTotal(l))}</em>
                {!locked && (
                  <button type="button" className={styles.iconBtnSm} onClick={() => removeLine(i)} aria-label="Retirer la ligne">
                    <Icon name="trash" size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <datalist id="doc-services">
            {SERVICES.map((s) => (
              <option key={s} value={s} />
            ))}
            <option value="Déplacement" />
            <option value="Supplément poils d'animaux" />
            <option value="Remise" />
          </datalist>
          {!locked && (
            <button type="button" className={styles.linkBtn} onClick={() => addLine()}>
              + Ajouter une ligne
            </button>
          )}
          <div className={styles.totalRow}>
            <span>Total TTC (TVA non applicable)</span>
            <strong>{euros2(total)}</strong>
          </div>
        </section>

        <section className={styles.sheetSection}>
          <h3>Dates et notes</h3>
          <div className={styles.grid2}>
            <label className={styles.field}>
              Date
              <input type="date" value={issued} onChange={mark((e) => setIssued(e.target.value))} disabled={locked} />
            </label>
            <label className={styles.field}>
              {doc.kind === 'devis' ? 'Valable jusqu’au' : 'À payer avant le'}
              <input type="date" value={due} onChange={mark((e) => setDue(e.target.value))} disabled={locked} />
            </label>
          </div>
          <label className={styles.field}>
            Notes (visibles sur le document)
            <textarea rows={3} value={notes} onChange={mark((e) => setNotes(e.target.value))} disabled={locked} />
          </label>
          {doc.paid_at && <p className={styles.hint}>Payée le {formatDate(doc.paid_at)}.</p>}
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
              <span>Supprimer {doc.number} ?</span>
              <button type="button" className={styles.btnSecondary} onClick={() => setConfirmDel(false)}>
                Non
              </button>
              <button type="button" className={styles.btnDanger} onClick={() => onDelete(doc)}>
                Oui, supprimer
              </button>
            </>
          ) : doc.kind === 'facture' && doc.status !== 'brouillon' ? (
            <span className={styles.hint}>Une facture envoyée ne se supprime pas : passez-la en « Annulé ».</span>
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
