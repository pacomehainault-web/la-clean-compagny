'use client'

import { useEffect, useState } from 'react'
import styles from '../admin.module.css'
import { Icon } from './Icon'
import {
  STATUSES,
  STATUS_LABEL,
  SERVICES,
  VEHICLE_SIZES,
  templates,
  telHref,
  whatsappHref,
  smsHref,
  gmailHref,
  mapsHref,
  emailSubject,
  formatPhone,
  formatDate,
  sourceLabel,
  toLocalInput,
  fromLocalInput,
  toDateInput,
  addDays,
  euros,
  timeAgo,
  gcalHref,
  euros2,
  DOC_STATUS,
} from '../_lib/crm'

const KIND_LABEL = {
  appel: '📞 Appel',
  whatsapp: '💬 WhatsApp',
  sms: '✉️ SMS',
  email: '📧 Email',
  note: '📝 Note',
  statut: '🔁 Statut',
  avis: '⭐ Avis',
  prestation: '🧽 Prestation',
  creation: '➕ Création',
}

// Fiche complète d'un prospect / client (panneau latéral).
export default function LeadSheet({ lead, jobs, docs = [], supabase, onClose, updateLead, logActivity, addJob, deleteJob, deleteLead, onCreateDoc, onOpenDoc, onPlanRdv }) {
  const [form, setForm] = useState(() => ({
    first_name: lead.first_name || '',
    phone: lead.phone || '',
    email: lead.email || '',
    city: lead.city || '',
    address: lead.address || '',
    vehicle: lead.vehicle || '',
    vehicle_size: lead.vehicle_size || '',
    service: lead.service || '',
    quoted_price: lead.quoted_price ?? '',
    appointment_at: toLocalInput(lead.appointment_at),
    next_followup_at: toDateInput(lead.next_followup_at),
    notes: lead.notes || '',
    lost_reason: lead.lost_reason || '',
  }))
  const [dirty, setDirty] = useState(false)
  const [tplId, setTplIdRaw] = useState(() => defaultTemplate(lead.status))
  const [text, setText] = useState(() => {
    const id = defaultTemplate(lead.status)
    const all = templates(lead)
    return (all.find((t) => t.id === id) || all[0]).text
  })
  const [activities, setActivities] = useState([])
  const [jobForm, setJobForm] = useState(null)
  const [note, setNote] = useState('')
  const [askLost, setAskLost] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const tpls = templates({ ...lead, ...formToLead(form) })
  const tpl = tpls.find((t) => t.id === tplId) || tpls[0]

  function setTplId(id) {
    setTplIdRaw(id)
    const t = tpls.find((x) => x.id === id)
    if (t) setText(t.text)
  }

  useEffect(() => {
    let cancelled = false
    supabase
      .from('activities')
      .select('*')
      .eq('lead_id', lead.id)
      .order('created_at', { ascending: false })
      .limit(100)
      .then(({ data }) => !cancelled && setActivities(data || []))
    return () => {
      cancelled = true
    }
  }, [supabase, lead.id, lead.status, jobs.length])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
    setDirty(true)
  }

  async function save() {
    const ok = await updateLead(lead, formToLead(form))
    if (ok) setDirty(false)
  }

  async function setStatus(status, extra = {}) {
    if (dirty) await updateLead(lead, formToLead(form), { silent: true })
    setDirty(false)
    await updateLead(lead, { status, ...extra })
  }

  function track(kind, label) {
    logActivity(lead.id, kind, label)
    setActivities((a) => [{ id: Math.random(), kind, content: label, created_at: new Date().toISOString() }, ...a])
    if (lead.status === 'nouveau' && kind !== 'note') updateLead(lead, { status: 'contacte' }, { silent: true })
    if ((tplId === 'avis' || tplId === 'relance-avis') && kind !== 'appel') {
      updateLead(lead, { status: 'avis_demande', review_requested_at: new Date().toISOString() }, { silent: true })
    }
  }

  async function addNote() {
    const v = note.trim()
    if (!v) return
    await logActivity(lead.id, 'note', v)
    setActivities((a) => [{ id: Math.random(), kind: 'note', content: v, created_at: new Date().toISOString() }, ...a])
    setNote('')
  }

  async function saveJob(e) {
    e.preventDefault()
    const ok = await addJob(lead, {
      done_at: jobForm.done_at,
      service: jobForm.service || 'Prestation',
      amount: Number(jobForm.amount || 0),
      notes: jobForm.notes || null,
    })
    if (ok) {
      setJobForm(null)
      setTplId('avis')
    }
  }

  const maps = mapsHref({ ...lead, ...formToLead(form) })
  const total = jobs.reduce((s, j) => s + Number(j.amount || 0), 0)

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label={`Fiche de ${lead.first_name}`}>
      <button type="button" className={styles.backdrop} onClick={onClose} aria-label="Fermer la fiche" />
      <div className={styles.sheet}>
        <header className={styles.sheetHead}>
          <div>
            <h2>{lead.first_name}</h2>
            <p>
              {formatPhone(lead.phone)} · {sourceLabel(lead.source)} · {timeAgo(lead.created_at)}
            </p>
          </div>
          <button type="button" className={styles.iconBtn} onClick={onClose} aria-label="Fermer">
            <Icon name="close" />
          </button>
        </header>

        {/* Étapes en un clic */}
        <div className={styles.steps}>
          {STATUSES.filter((s) => s.id !== 'perdu').map((s) => (
            <button
              type="button"
              key={s.id}
              className={`${styles.step} ${lead.status === s.id ? styles.stepOn : ''}`}
              onClick={() => {
                if (s.id === 'fait' && jobs.length === 0) {
                  setJobForm({ done_at: new Date().toISOString().slice(0, 10), service: form.service, amount: form.quoted_price, notes: '' })
                  return
                }
                setStatus(s.id, s.id === 'avis_demande' ? { review_requested_at: new Date().toISOString() } : {})
              }}
            >
              {s.short}
            </button>
          ))}
          <button type="button" className={`${styles.step} ${styles.stepLost} ${lead.status === 'perdu' ? styles.stepOn : ''}`} onClick={() => setAskLost(true)}>
            Perdu
          </button>
        </div>

        {askLost && (
          <div className={styles.inlineBox}>
            <label className={styles.field}>
              Pourquoi c&apos;est perdu ?
              <select value={form.lost_reason} onChange={(e) => set('lost_reason', e.target.value)}>
                <option value="">Choisir…</option>
                <option>Trop cher</option>
                <option>Pas de réponse</option>
                <option>A choisi un concurrent</option>
                <option>Pas disponible / délai</option>
                <option>Hors zone</option>
                <option>Ne voulait qu&apos;un renseignement</option>
                <option>Autre</option>
              </select>
            </label>
            <div className={styles.rowBtns}>
              <button type="button" className={styles.btnSecondary} onClick={() => setAskLost(false)}>
                Annuler
              </button>
              <button
                type="button"
                className={styles.btnDanger}
                onClick={async () => {
                  await setStatus('perdu', { lost_reason: form.lost_reason || null, next_followup_at: null })
                  setAskLost(false)
                }}
              >
                Marquer perdu
              </button>
            </div>
          </div>
        )}

        {jobForm && (
          <form className={styles.inlineBox} onSubmit={saveJob}>
            <strong>Prestation faite 🎉</strong>
            <div className={styles.grid2}>
              <label className={styles.field}>
                Date
                <input type="date" required value={jobForm.done_at} onChange={(e) => setJobForm({ ...jobForm, done_at: e.target.value })} />
              </label>
              <label className={styles.field}>
                Montant encaissé (€)
                <input type="number" min="0" step="1" inputMode="decimal" required value={jobForm.amount} onChange={(e) => setJobForm({ ...jobForm, amount: e.target.value })} />
              </label>
            </div>
            <label className={styles.field}>
              Prestation
              <input list="services-list" value={jobForm.service} onChange={(e) => setJobForm({ ...jobForm, service: e.target.value })} />
            </label>
            <label className={styles.field}>
              Notes (optionnel)
              <input value={jobForm.notes} onChange={(e) => setJobForm({ ...jobForm, notes: e.target.value })} placeholder="Ex. poils de chien, siège taché" />
            </label>
            <div className={styles.rowBtns}>
              <button type="button" className={styles.btnSecondary} onClick={() => setJobForm(null)}>
                Annuler
              </button>
              <button type="submit" className={styles.btnPrimary}>
                Enregistrer
              </button>
            </div>
          </form>
        )}

        {/* Contacter */}
        <section className={styles.sheetSection}>
          <h3>Contacter</h3>
          <div className={styles.quickRow}>
            <a className={styles.actCall} href={telHref(lead)} onClick={() => track('appel', 'Appel lancé')}>
              <Icon name="phone" size={17} /> <span>Appeler</span>
            </a>
            {onPlanRdv && (
              <button type="button" className={styles.btnPrimary} onClick={() => onPlanRdv({ ...lead, ...formToLead(form) })}>
                <Icon name="calendar" size={17} /> {lead.appointment_at && new Date(lead.appointment_at) > new Date() ? 'Nouveau RDV' : 'Planifier un RDV'}
              </button>
            )}
            {maps && (
              <a className={styles.btnSecondary} href={maps} target="_blank" rel="noopener noreferrer">
                <Icon name="map" size={17} /> Itinéraire
              </a>
            )}
            {lead.appointment_at && (
              <a className={styles.btnSecondary} href={gcalHref(lead)} target="_blank" rel="noopener noreferrer">
                <Icon name="calendar" size={17} /> Google Agenda
              </a>
            )}
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={() => navigator.clipboard?.writeText(lead.phone)}
            >
              <Icon name="copy" size={17} /> Copier le n°
            </button>
          </div>
          <div className={styles.tplChips}>
            {tpls.map((t) => (
              <button type="button" key={t.id} className={`${styles.chip} ${tplId === t.id ? styles.chipOn : ''}`} onClick={() => setTplId(t.id)}>
                {t.label}
              </button>
            ))}
          </div>
          <textarea className={styles.msgBox} rows={5} value={text} onChange={(e) => setText(e.target.value)} aria-label="Message" />
          <div className={styles.quickRow}>
            <a className={styles.actWa} href={whatsappHref(lead, text)} target="_blank" rel="noopener noreferrer" onClick={() => track('whatsapp', `WhatsApp « ${tpl.label} »`)}>
              <Icon name="whatsapp" size={17} /> <span>WhatsApp</span>
            </a>
            <a className={styles.btnSecondary} href={smsHref(lead, text)} onClick={() => track('sms', `SMS « ${tpl.label} »`)}>
              <Icon name="sms" size={17} /> SMS
            </a>
            {lead.email && (
              <a
                className={styles.btnSecondary}
                href={gmailHref(lead, emailSubject(lead), text)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track('email', `Email « ${tpl.label} »`)}
              >
                <Icon name="mail" size={17} /> Gmail
              </a>
            )}
            <button type="button" className={styles.btnSecondary} onClick={() => navigator.clipboard?.writeText(text)}>
              <Icon name="copy" size={17} /> Copier
            </button>
          </div>
        </section>

        {/* Infos */}
        <section className={styles.sheetSection}>
          <h3>Infos</h3>
          <div className={styles.grid2}>
            <label className={styles.field}>
              Prénom / nom
              <input value={form.first_name} onChange={(e) => set('first_name', e.target.value)} />
            </label>
            <label className={styles.field}>
              Téléphone
              <input type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
            </label>
            <label className={styles.field}>
              Email
              <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
            </label>
            <label className={styles.field}>
              Ville
              <input value={form.city} onChange={(e) => set('city', e.target.value)} />
            </label>
          </div>
          <label className={styles.field}>
            Adresse d&apos;intervention
            <input value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="N°, rue" />
          </label>
          <div className={styles.grid2}>
            <label className={styles.field}>
              Véhicule
              <input value={form.vehicle} onChange={(e) => set('vehicle', e.target.value)} placeholder="Ex. Peugeot 3008" />
            </label>
            <label className={styles.field}>
              Gabarit
              <select value={form.vehicle_size} onChange={(e) => set('vehicle_size', e.target.value)}>
                <option value="">—</option>
                {VEHICLE_SIZES.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className={styles.field}>
            Prestation
            <input list="services-list" value={form.service} onChange={(e) => set('service', e.target.value)} />
          </label>
          <div className={styles.grid2}>
            <label className={styles.field}>
              Prix proposé (€)
              <input type="number" min="0" step="1" inputMode="decimal" value={form.quoted_price} onChange={(e) => set('quoted_price', e.target.value)} />
            </label>
            <label className={styles.field}>
              Rendez-vous
              <input type="datetime-local" value={form.appointment_at} onChange={(e) => set('appointment_at', e.target.value)} />
            </label>
          </div>
          <label className={styles.field}>
            Relancer le
            <div className={styles.followRow}>
              <input type="date" value={form.next_followup_at} onChange={(e) => set('next_followup_at', e.target.value)} />
              {[1, 3, 7].map((d) => (
                <button type="button" key={d} className={styles.chip} onClick={() => set('next_followup_at', addDays(new Date(), d).toISOString().slice(0, 10))}>
                  +{d} j
                </button>
              ))}
              {form.next_followup_at && (
                <button type="button" className={styles.chip} onClick={() => set('next_followup_at', '')}>
                  Aucune
                </button>
              )}
            </div>
          </label>
          <label className={styles.field}>
            Notes
            <textarea rows={3} value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="État du véhicule, code portail, préférences…" />
          </label>
          {dirty && (
            <div className={styles.saveBar}>
              <span>Modifications non enregistrées</span>
              <button type="button" className={styles.btnPrimary} onClick={save}>
                Enregistrer
              </button>
            </div>
          )}
          {form.appointment_at && lead.status !== 'reserve' && !['fait', 'avis_demande', 'avis_recu'].includes(lead.status) && (
            <button type="button" className={styles.linkBtn} onClick={() => setStatus('reserve')}>
              → Passer en « Réservé »
            </button>
          )}
        </section>

        {lead.message && (
          <section className={styles.sheetSection}>
            <h3>Demande d&apos;origine</h3>
            <pre className={styles.message}>{lead.message}</pre>
          </section>
        )}

        {/* Devis et factures */}
        <section className={styles.sheetSection}>
          <div className={styles.sectionTitleRow}>
            <h3>Devis et factures</h3>
            <div className={styles.rowBtns}>
              <button type="button" className={styles.linkBtn} onClick={() => onCreateDoc('devis', { ...lead, ...formToLead(form) })}>
                + Devis
              </button>
              <button type="button" className={styles.linkBtn} onClick={() => onCreateDoc('facture', { ...lead, ...formToLead(form) })}>
                + Facture
              </button>
            </div>
          </div>
          {docs.length === 0 ? (
            <p className={styles.emptySmall}>Aucun devis ni facture pour ce client.</p>
          ) : (
            <ul className={styles.jobs}>
              {docs.map((d) => (
                <li key={d.id}>
                  <span>{d.number}</span>
                  <button type="button" className={styles.linkBtn} onClick={() => onOpenDoc(d.id)}>
                    {d.kind === 'devis' ? 'Devis' : 'Facture'} · {DOC_STATUS[d.status]}
                  </button>
                  <em>{euros2(d.total)}</em>
                  <span />
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Prestations */}
        <section className={styles.sheetSection}>
          <div className={styles.sectionTitleRow}>
            <h3>Prestations {jobs.length > 0 && <span className={styles.count}>{euros(total)}</span>}</h3>
            <button
              type="button"
              className={styles.linkBtn}
              onClick={() => setJobForm({ done_at: new Date().toISOString().slice(0, 10), service: form.service, amount: form.quoted_price, notes: '' })}
            >
              + Ajouter
            </button>
          </div>
          {jobs.length === 0 ? (
            <p className={styles.emptySmall}>Aucune prestation enregistrée.</p>
          ) : (
            <ul className={styles.jobs}>
              {jobs.map((j) => (
                <li key={j.id}>
                  <span>{formatDate(j.done_at)}</span>
                  <strong>{j.service}</strong>
                  <em>{euros(j.amount)}</em>
                  <button type="button" className={styles.iconBtnSm} aria-label="Supprimer cette prestation" onClick={() => window.confirm('Supprimer cette prestation ?') && deleteJob(j)}>
                    <Icon name="trash" size={15} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Historique */}
        <section className={styles.sheetSection}>
          <h3>Historique</h3>
          <div className={styles.noteRow}>
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ajouter une note (appel, info…)" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addNote())} />
            <button type="button" className={styles.btnSecondary} onClick={addNote}>
              Ajouter
            </button>
          </div>
          <ul className={styles.timeline}>
            {activities.map((a) => (
              <li key={a.id}>
                <span>{KIND_LABEL[a.kind] || a.kind}</span>
                <p>{a.content}</p>
                <em>
                  {formatDate(a.created_at, { dateStyle: 'short', timeStyle: 'short' })}
                  {a.author ? ` · ${a.author.split('@')[0]}` : ''}
                </em>
              </li>
            ))}
            <li>
              <span>📥 Reçu</span>
              <p>
                {sourceLabel(lead.source)}
                {lead.consent_relance ? ' · accepte les relances' : ''}
              </p>
              <em>{formatDate(lead.created_at, { dateStyle: 'short', timeStyle: 'short' })}</em>
            </li>
          </ul>
        </section>

        <footer className={styles.sheetFoot}>
          {confirmDelete ? (
            <>
              <span>Supprimer définitivement cette fiche ?</span>
              <button type="button" className={styles.btnSecondary} onClick={() => setConfirmDelete(false)}>
                Non
              </button>
              <button type="button" className={styles.btnDanger} onClick={() => deleteLead(lead)}>
                Oui, supprimer
              </button>
            </>
          ) : (
            <button type="button" className={styles.linkDanger} onClick={() => setConfirmDelete(true)}>
              <Icon name="trash" size={15} /> Supprimer la fiche
            </button>
          )}
        </footer>

        <datalist id="services-list">
          {SERVICES.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
        <span className={styles.srOnly}>Statut actuel : {STATUS_LABEL[lead.status]}</span>
      </div>
    </div>
  )
}

function defaultTemplate(status) {
  return (
    {
      nouveau: 'premier',
      contacte: 'devis',
      devis_envoye: 'relance-devis',
      reserve: 'confirmation',
      fait: 'avis',
      avis_demande: 'relance-avis',
      avis_recu: 'entretien',
      perdu: 'relance-devis',
    }[status] || 'premier'
  )
}

function formToLead(f) {
  const num = f.quoted_price === '' || f.quoted_price === null ? null : Number(f.quoted_price)
  return {
    first_name: f.first_name.trim() || 'Sans nom',
    phone: f.phone.trim(),
    email: f.email.trim() || null,
    city: f.city.trim() || null,
    address: f.address.trim() || null,
    vehicle: f.vehicle.trim() || null,
    vehicle_size: f.vehicle_size || null,
    service: f.service.trim() || null,
    quoted_price: Number.isFinite(num) ? num : null,
    appointment_at: fromLocalInput(f.appointment_at),
    next_followup_at: f.next_followup_at ? new Date(`${f.next_followup_at}T09:00:00`).toISOString() : null,
    notes: f.notes.trim() || null,
    lost_reason: f.lost_reason || null,
  }
}
