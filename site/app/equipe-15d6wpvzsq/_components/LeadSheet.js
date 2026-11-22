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
  originText,
  toLocalInput,
  fromLocalInput,
  toDateInput,
  addDays,
  euros,
  timeAgo,
  gcalHref,
  euros2,
  DOC_STATUS,
  trackUrl,
  loyalty,
  referralInfo,
  referralGoal,
  referralLink,
  wazeHref,
  sameDay,
  formatTime,
  formatDayLabel,
} from '../_lib/crm'
import v2 from '../v2.module.css'
import { photoUrl, uploadPhoto } from '../_lib/media'
import ReviewSend, { lastAfterPhoto } from './ReviewSend'
import { partnerList } from './Partners'
import AddressAutocomplete from '@/components/AddressAutocomplete'

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
  sms_auto: '🤖 SMS auto',
}

// Fiche complète d'un prospect / client (panneau latéral).
export default function LeadSheet({ lead, jobs, allJobs = [], docs = [], allLeads = [], photos = [], subscription = null, settings, supabase, onClose, updateLead, logActivity, addJob, deleteJob, deleteLead, onCreateDoc, onOpenDoc, onPlanRdv, onVisit, onAddSub, onUpdateSub, onGo, onComplete, onPhotos }) {
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
    partner: lead.partner || '',
    plate: lead.plate || '',
    ref_code: lead.ref_code || '',
    coords: null,
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
  const [tab, setTab] = useState('suivi')
  const [uploading, setUploading] = useState(false)

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
    const changes = formToLead(form)
    if (form.coords) Object.assign(changes, { lat: form.coords.lat, lng: form.coords.lng })
    else if ((changes.address || null) !== (lead.address || null) || (changes.city || null) !== (lead.city || null)) Object.assign(changes, { lat: null, lng: null })
    const ok = await updateLead(lead, changes)
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

  // Photo « après » ajoutée directement depuis la fiche (pour la demande d'avis).
  async function addAfterPhoto(file) {
    if (!file || !supabase) return
    setUploading(true)
    try {
      const row = await uploadPhoto(supabase, { leadId: lead.id, kind: 'apres', file })
      onPhotos?.({ add: [row] })
    } catch {
      window.alert("La photo n'a pas pu être envoyée. Réessayez.")
    }
    setUploading(false)
  }

  // Demande d'avis envoyée (avec ou sans photo) : historique + étape « Avis demandé ».
  function reviewSent(ch, relance) {
    const label = relance ? 'Relance avis' : 'Demande d’avis'
    logActivity(lead.id, ch === 'partage' ? 'whatsapp' : ch, ch === 'partage' ? `${label} envoyée avec la photo` : `${label} envoyée`)
    setActivities((a) => [{ id: Math.random(), kind: ch === 'partage' ? 'whatsapp' : ch, content: `${label} envoyée`, created_at: new Date().toISOString() }, ...a])
    if (!lead.review_done) updateLead(lead, { status: 'avis_demande', review_requested_at: new Date().toISOString() }, { silent: true })
  }

  function openMessage(id) {
    if (id) setTplId(id)
    setTab('message')
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

  const cur = { ...lead, ...formToLead(form) }
  const maps = mapsHref(cur)
  const waze = wazeHref(cur)
  const total = jobs.reduce((s, j) => s + Number(j.amount || 0), 0)
  const now = new Date()
  const rdv = lead.appointment_at ? new Date(lead.appointment_at) : null
  const rdvToday = rdv && sameDay(lead.appointment_at, now)
  const rdvFuture = rdv && rdv > now
  const afterPhoto = lastAfterPhoto(photos, lead.id)
  const isReview = tplId === 'avis' || tplId === 'relance-avis'
  const tplGroups = TPL_GROUPS.map((g) => ({ ...g, items: g.ids.map((id) => tpls.find((t) => t.id === id)).filter(Boolean) }))
  const loy = loyalty(jobs.length, settings?.business?.loyalty_every)
  const goal = referralGoal(settings)
  const ref = referralInfo(lead, allLeads, allJobs, goal)
  const parrain = lead.ref_code ? allLeads.find((l) => l.referral_code === lead.ref_code.toUpperCase()) : null
  const sub = [lead.vehicle, formatPhone(lead.phone)].filter(Boolean).join(' · ')
  const openJobForm = () => setJobForm({ done_at: new Date().toISOString().slice(0, 10), service: form.service, amount: form.quoted_price, notes: '' })

  // Envoi rapide d'un modèle (bouton de l'étape « À faire »).
  const quickSend = (id, channel = 'whatsapp') => {
    const t = tpls.find((x) => x.id === id)
    if (!t) return {}
    return channel === 'sms'
      ? { href: smsHref(lead, t.text), onClick: () => track('sms', `SMS « ${t.label} »`) }
      : { href: whatsappHref(lead, t.text), target: '_blank', rel: 'noopener noreferrer', onClick: () => track('whatsapp', `WhatsApp « ${t.label} »`) }
  }

  // ---------- « À faire maintenant » : une seule action principale selon l'étape ----------
  function nextStep() {
    const st = lead.status
    if (st === 'nouveau' || st === 'contacte') {
      return {
        title: st === 'nouveau' ? 'Premier contact' : 'Envoyer le prix',
        hint: st === 'nouveau' ? `Reçu ${timeAgo(lead.created_at)} · ${sourceLabel(lead.source)}` : 'Proposez le prix et un créneau',
        body: (
          <div className={v2.nsBtns}>
            {st === 'nouveau' ? (
              <a className={styles.actCall} href={telHref(lead)} onClick={() => track('appel', 'Appel lancé')}>
                <Icon name="phone" size={17} /> Appeler
              </a>
            ) : (
              <button type="button" className={styles.btnPrimary} onClick={() => onCreateDoc('devis', cur)}>
                <Icon name="file" size={17} /> Faire le devis
              </button>
            )}
            <a className={styles.actWa} {...quickSend(st === 'nouveau' ? 'premier' : 'devis')}>
              <Icon name="whatsapp" size={17} /> {st === 'nouveau' ? 'Message' : 'Prix par WhatsApp'}
            </a>
          </div>
        ),
      }
    }
    if (st === 'devis_envoye') {
      return {
        title: 'Relancer le devis',
        hint: lead.next_followup_at ? `Relance prévue le ${formatDate(lead.next_followup_at)}` : 'Pas de réponse ? Une relance suffit souvent',
        body: (
          <div className={v2.nsBtns}>
            <a className={styles.actWa} {...quickSend('relance-devis')}>
              <Icon name="whatsapp" size={17} /> Relancer
            </a>
            {onPlanRdv && (
              <button type="button" className={styles.btnPrimary} onClick={() => onPlanRdv(cur)}>
                <Icon name="calendar" size={17} /> Il a dit oui : RDV
              </button>
            )}
          </div>
        ),
      }
    }
    if (st === 'reserve' && rdv) {
      if (rdvToday) {
        const stage = lead.track_stage
        return {
          title: stage === 'sur_place' ? 'Nettoyage en cours' : stage === 'en_route' ? 'En route' : `Aujourd'hui à ${formatTime(lead.appointment_at)}`,
          hint: [lead.service, [lead.address, lead.city].filter(Boolean).join(', ')].filter(Boolean).join(' · ') || 'Adresse à compléter',
          body: (
            <>
              <div className={v2.nsBtns}>
                {stage === 'sur_place'
                  ? onComplete && (
                      <button type="button" className={styles.btnPrimary} onClick={() => onComplete(lead)}>
                        <Icon name="check" size={17} /> Terminé
                      </button>
                    )
                  : onGo && (
                      <button type="button" className={styles.btnPrimary} onClick={() => onGo(lead)}>
                        <Icon name="car" size={17} /> {stage === 'en_route' ? 'Je suis arrivé' : 'Je pars (prévenir)'}
                      </button>
                    )}
                {waze ? (
                  <a className={styles.btnSecondary} href={waze} target="_blank" rel="noopener noreferrer">
                    <Icon name="route" size={17} /> Waze
                  </a>
                ) : null}
              </div>
              {onVisit && (
                <button type="button" className={styles.linkBtn} onClick={() => onVisit(lead)}>
                  <Icon name="camera" size={15} /> Photos &amp; checklist de l&apos;intervention
                </button>
              )}
            </>
          ),
        }
      }
      if (rdvFuture) {
        const tomorrow = sameDay(lead.appointment_at, addDays(now, 1))
        return {
          title: `RDV ${formatDayLabel(lead.appointment_at).toLowerCase()} à ${formatTime(lead.appointment_at)}`,
          hint: tomorrow ? 'Envoyez le rappel de la veille' : 'Confirmez le rendez-vous au client',
          body: (
            <div className={v2.nsBtns}>
              <a className={styles.actWa} {...quickSend(tomorrow ? 'veille' : 'confirmation')}>
                <Icon name="whatsapp" size={17} /> {tomorrow ? 'Rappel de la veille' : 'Confirmer le RDV'}
              </a>
              {lead.appointment_at && (
                <a className={styles.btnSecondary} href={gcalHref(lead)} target="_blank" rel="noopener noreferrer">
                  <Icon name="calendar" size={17} /> Agenda
                </a>
              )}
            </div>
          ),
        }
      }
      return {
        title: 'RDV passé : c’est fait ?',
        hint: `Prévu ${formatDate(lead.appointment_at)} à ${formatTime(lead.appointment_at)}`,
        body: (
          <div className={v2.nsBtns}>
            <button type="button" className={styles.btnPrimary} onClick={() => (onComplete ? onComplete(lead) : openJobForm())}>
              <Icon name="check" size={17} /> Oui, terminé
            </button>
            {onPlanRdv && (
              <button type="button" className={styles.btnSecondary} onClick={() => onPlanRdv(cur)}>
                <Icon name="calendar" size={17} /> Décaler
              </button>
            )}
          </div>
        ),
      }
    }
    if (st === 'fait' || st === 'avis_demande') {
      const relance = st === 'avis_demande'
      return {
        title: relance ? 'Relancer pour l’avis' : 'Demander l’avis Google',
        hint: relance && lead.review_requested_at ? `Demandé ${timeAgo(lead.review_requested_at)}` : 'Avec la photo « après », ça marche beaucoup mieux',
        body: (
          <>
            {!afterPhoto && supabase && (
              <label className={`${styles.btnSecondary} ${styles.btnBlock}`}>
                <Icon name="camera" size={16} /> {uploading ? 'Envoi de la photo…' : 'Ajouter la photo « après »'}
                <input type="file" accept="image/*" hidden disabled={uploading} onChange={(e) => addAfterPhoto(e.target.files?.[0])} />
              </label>
            )}
            <ReviewSend lead={lead} photo={afterPhoto} relance={relance} compact onSent={(ch) => reviewSent(ch, relance)} />
            <button type="button" className={styles.linkBtn} onClick={() => setStatus('avis_recu')}>
              ✓ Il a laissé son avis
            </button>
          </>
        ),
      }
    }
    if (st === 'avis_recu') {
      return {
        title: 'Client fidèle ⭐',
        hint: `${jobs.length} prestation${jobs.length > 1 ? 's' : ''} · ${ref.shown}/${goal} filleuls`,
        body: (
          <div className={v2.nsBtns}>
            <a className={styles.actWa} {...quickSend('parrainage')}>
              <Icon name="gift" size={17} /> Lien de parrainage
            </a>
            <a className={styles.btnSecondary} {...quickSend('entretien')}>
              <Icon name="repeat" size={17} /> Relance entretien
            </a>
          </div>
        ),
      }
    }
    if (st === 'perdu') {
      return {
        title: 'Perdu',
        hint: lead.lost_reason || 'Raison non précisée',
        body: (
          <div className={v2.nsBtns}>
            <a className={styles.btnSecondary} {...quickSend('relance-devis')}>
              <Icon name="whatsapp" size={17} /> Retenter
            </a>
          </div>
        ),
      }
    }
    return null
  }
  const ns = nextStep()

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label={`Fiche de ${lead.first_name}`}>
      <button type="button" className={styles.backdrop} onClick={onClose} aria-label="Fermer la fiche" />
      <div className={styles.sheet}>
        <header className={styles.sheetHead}>
          <div>
            <h2>{lead.first_name}</h2>
            <p>{sub || sourceLabel(lead.source)}</p>
          </div>
          <button type="button" className={styles.iconBtn} onClick={onClose} aria-label="Fermer">
            <Icon name="close" />
          </button>
        </header>

        {/* Raccourcis : toujours au même endroit */}
        <nav className={v2.lsQuick} aria-label="Actions rapides">
          <a href={telHref(lead)} onClick={() => track('appel', 'Appel lancé')}>
            <Icon name="phone" size={20} />
            <span>Appeler</span>
          </a>
          <button type="button" onClick={() => openMessage()}>
            <Icon name="whatsapp" size={20} />
            <span>Message</span>
          </button>
          {waze || maps ? (
            <a href={waze || maps} target="_blank" rel="noopener noreferrer">
              <Icon name="route" size={20} />
              <span>{waze ? 'Waze' : 'Itinéraire'}</span>
            </a>
          ) : (
            <button type="button" onClick={() => setTab('infos')}>
              <Icon name="map" size={20} />
              <span>Adresse ?</span>
            </button>
          )}
          {onPlanRdv && (
            <button type="button" onClick={() => onPlanRdv(cur)}>
              <Icon name="calendar" size={20} />
              <span>RDV</span>
            </button>
          )}
        </nav>

        {/* Étape : un menu au lieu de 8 boutons */}
        <div className={v2.lsStage}>
          <span>Étape</span>
          <div className={v2.lsStageTrack} aria-hidden="true">
            {STATUSES.filter((s) => s.id !== 'perdu').map((s, i, arr) => {
              const at = arr.findIndex((x) => x.id === lead.status)
              return <i key={s.id} className={lead.status === 'perdu' ? '' : i <= at ? v2.lsStageOn : ''} />
            })}
          </div>
          <label className={v2.lsStageSelect}>
            <select
              value={lead.status}
              aria-label="Changer l'étape"
              onChange={(e) => {
                const id = e.target.value
                if (id === 'perdu') return setAskLost(true)
                if (id === 'fait' && jobs.length === 0) return openJobForm()
                setStatus(id, id === 'avis_demande' ? { review_requested_at: new Date().toISOString() } : {})
              }}
            >
              {STATUSES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
            <Icon name="right" size={14} />
          </label>
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

        {/* À faire maintenant */}
        {ns && !askLost && !jobForm && (
          <section className={v2.nextStep}>
            <div className={v2.nsHead}>
              <span>À faire maintenant</span>
              <strong>{ns.title}</strong>
              {ns.hint && <em>{ns.hint}</em>}
            </div>
            {ns.body}
          </section>
        )}

        {/* Onglets */}
        <div className={v2.lsTabs} role="tablist">
          {[
            ['suivi', 'Suivi'],
            ['message', 'Message'],
            ['infos', dirty ? 'Infos •' : 'Infos'],
            ['historique', 'Historique'],
          ].map(([id, label]) => (
            <button type="button" role="tab" key={id} aria-selected={tab === id} className={tab === id ? v2.lsTabOn : ''} onClick={() => setTab(id)}>
              {label}
            </button>
          ))}
        </div>

        {/* ---------- SUIVI ---------- */}
        {tab === 'suivi' && (
          <>
            <section className={styles.sheetSection}>
              <div className={styles.sectionTitleRow}>
                <h3>Rendez-vous</h3>
                <button type="button" className={styles.linkBtn} onClick={() => setTab('infos')}>
                  Modifier
                </button>
              </div>
              <dl className={v2.lsFacts}>
                <div>
                  <dt>Quand</dt>
                  <dd>{rdv ? `${formatDayLabel(lead.appointment_at)} à ${formatTime(lead.appointment_at)}` : '—'}</dd>
                </div>
                <div>
                  <dt>Où</dt>
                  <dd>{[lead.address, lead.city].filter(Boolean).join(', ') || '—'}</dd>
                </div>
                <div>
                  <dt>Prestation</dt>
                  <dd>
                    {lead.service || '—'}
                    {lead.quoted_price != null ? ` · ${euros(lead.quoted_price)}` : ''}
                  </dd>
                </div>
                <div>
                  <dt>Véhicule</dt>
                  <dd>{[lead.vehicle, lead.plate, lead.partner].filter(Boolean).join(' · ') || '—'}</dd>
                </div>
                {lead.notes && (
                  <div className={v2.lsFactWide}>
                    <dt>Notes</dt>
                    <dd>{lead.notes}</dd>
                  </div>
                )}
              </dl>
              {lead.message && (
                <details className={v2.lsDetails}>
                  <summary>Demande d&apos;origine</summary>
                  <pre className={styles.message}>{lead.message}</pre>
                </details>
              )}
            </section>

            <section className={styles.sheetSection}>
              <div className={styles.sectionTitleRow}>
                <h3>Photos</h3>
                {onVisit && lead.appointment_at && (
                  <button type="button" className={styles.linkBtn} onClick={() => onVisit(lead)}>
                    <Icon name="camera" size={15} /> Intervention
                  </button>
                )}
              </div>
              {photos.length > 0 ? (
                <div className={v2.leadPhotos}>
                  {photos.slice(0, 12).map((p) => (
                    <a key={p.id} href={photoUrl(p.path)} target="_blank" rel="noopener noreferrer" title={`${p.kind} · ${formatDate(p.taken_on)}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photoUrl(p.path)} alt={p.kind} loading="lazy" />
                      <em>{p.kind === 'apres' ? 'après' : p.kind}</em>
                    </a>
                  ))}
                </div>
              ) : (
                <p className={styles.emptySmall}>Pas encore de photo.</p>
              )}
              <div className={v2.trackRow}>
                <Icon name="link" size={16} />
                <span>Sa page : suivi, devis, photos, facture, avis</span>
                <a className={styles.linkBtn} href={trackUrl(lead)} target="_blank" rel="noopener noreferrer">
                  Voir
                </a>
                <button
                  type="button"
                  className={styles.linkBtn}
                  onClick={() => {
                    navigator.clipboard?.writeText(trackUrl(lead))
                    logActivity(lead.id, 'note', 'Lien de suivi copié')
                  }}
                >
                  Copier
                </button>
              </div>
            </section>

            <section className={styles.sheetSection}>
              <div className={styles.sectionTitleRow}>
                <h3>Devis et factures</h3>
                <div className={styles.rowBtns}>
                  <button type="button" className={styles.linkBtn} onClick={() => onCreateDoc('devis', cur)}>
                    + Devis
                  </button>
                  <button type="button" className={styles.linkBtn} onClick={() => onCreateDoc('facture', cur)}>
                    + Facture
                  </button>
                </div>
              </div>
              {docs.length === 0 ? (
                <p className={styles.emptySmall}>Aucun devis ni facture.</p>
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

            <section className={styles.sheetSection}>
              <div className={styles.sectionTitleRow}>
                <h3>Prestations {jobs.length > 0 && <span className={styles.count}>{euros(total)}</span>}</h3>
                <button type="button" className={styles.linkBtn} onClick={openJobForm}>
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

            <section className={styles.sheetSection}>
              <h3>Fidélité &amp; parrainage</h3>
              <div className={v2.loyRow}>
                <div className={v2.loyaltyDots} aria-label={`${loy.inCycle} sur ${loy.every - 1} passages`}>
                  {Array.from({ length: loy.every }, (_, i) => (
                    <i key={i} className={i < loy.inCycle ? v2.dotOn : i === loy.every - 1 ? v2.dotGift : ''} />
                  ))}
                </div>
                <span>{loy.rewardNow ? `🎁 la prochaine à -${settings?.business?.loyalty_discount || 20} %` : `encore ${loy.left} avant la remise`}</span>
              </div>
              <div className={v2.loyRow} style={{ display: 'block' }}>
                <span>
                  <Icon name="gift" size={16} /> Code <strong className={v2.codeTag}>{lead.referral_code}</strong>
                  {lead.ref_code ? ` · parrainé par ${parrain ? parrain.first_name : `le code ${lead.ref_code}`}` : ''}
                </span>
                <div className={v2.refProgress}>
                  <div className={v2.progressBar} aria-hidden="true">
                    <i style={{ width: `${Math.round((ref.shown / goal) * 100)}%` }} />
                  </div>
                  <span>
                    {ref.shown} / {goal} filleul{ref.shown > 1 ? 's' : ''}
                    {ref.waiting.length ? ` · ${ref.waiting.length} en attente : ${ref.waiting.map((k) => k.first_name).join(', ')}` : ''}
                    {ref.done.length ? ` · faits : ${ref.done.map((k) => k.first_name).join(', ')}` : ''}
                  </span>
                </div>
                {ref.available > 0 && (
                  <div className={v2.refReward}>
                    <span>🎁 {ref.available > 1 ? `${ref.available} nettoyages offerts` : 'Nettoyage Sortie de Concession offert'} à utiliser</span>
                    <button
                      type="button"
                      className={styles.btnSecondary}
                      onClick={async () => {
                        if (!window.confirm('Marquer le nettoyage offert comme utilisé ?')) return
                        await updateLead(lead, { referral_rewards_used: ref.used + 1 })
                        logActivity(lead.id, 'note', 'Récompense parrainage utilisée (nettoyage offert)')
                      }}
                    >
                      Marquer utilisé
                    </button>
                  </div>
                )}
                <div className={v2.inlineLinks}>
                  <button type="button" className={styles.linkBtn} onClick={() => openMessage('parrainage')}>
                    <Icon name="whatsapp" size={15} /> Lui envoyer son lien
                  </button>
                  <button
                    type="button"
                    className={styles.linkBtn}
                    onClick={() => {
                      navigator.clipboard?.writeText(referralLink(lead))
                      logActivity(lead.id, 'note', 'Lien de parrainage copié')
                    }}
                  >
                    <Icon name="copy" size={15} /> Copier
                  </button>
                </div>
              </div>
              {subscription ? (
                <div className={v2.loyRow}>
                  <Icon name="repeat" size={16} />
                  <span>
                    Formule « {subscription.label} » · {euros(subscription.price)} tous les {subscription.every_days} j
                    {subscription.active ? (subscription.next_on ? ` · prochain ${formatDate(subscription.next_on)}` : '') : ' · en pause'}
                  </span>
                  {onUpdateSub && (
                    <button type="button" className={styles.linkBtn} onClick={() => onUpdateSub(subscription, { active: !subscription.active })}>
                      {subscription.active ? 'Pause' : 'Réactiver'}
                    </button>
                  )}
                </div>
              ) : (
                onAddSub &&
                jobs.length > 0 && (
                  <button
                    type="button"
                    className={styles.linkBtn}
                    onClick={() =>
                      onAddSub({
                        lead_id: lead.id,
                        label: `Entretien ${lead.vehicle || ''}`.trim(),
                        price: Math.round((Number(lead.quoted_price) || Number(jobs[0]?.amount) || 0) * 0.85),
                        every_days: 30,
                        next_on: toDateInput(addDays(new Date(), 30).toISOString()),
                      })
                    }
                  >
                    <Icon name="repeat" size={15} /> Créer une formule d&apos;entretien mensuelle
                  </button>
                )
              )}
            </section>
          </>
        )}

        {/* ---------- MESSAGE ---------- */}
        {tab === 'message' && (
          <section className={styles.sheetSection}>
            <label className={styles.field}>
              Modèle
              <select value={tplId} onChange={(e) => setTplId(e.target.value)}>
                {tplGroups.map((g) => (
                  <optgroup key={g.label} label={g.label}>
                    {g.items.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>
            {isReview && afterPhoto ? (
              <>
                <ReviewSend lead={lead} photo={afterPhoto} relance={tplId === 'relance-avis'} onSent={(ch) => reviewSent(ch, tplId === 'relance-avis')} />
                <p className={styles.hint}>Le message est déjà rédigé (lien de l&apos;avis + sa page avec les photos).</p>
              </>
            ) : (
              <>
                {isReview && !afterPhoto && supabase && (
                  <label className={`${styles.btnSecondary} ${styles.btnBlock}`}>
                    <Icon name="camera" size={16} /> {uploading ? 'Envoi de la photo…' : 'Ajouter la photo « après »'}
                    <input type="file" accept="image/*" hidden disabled={uploading} onChange={(e) => addAfterPhoto(e.target.files?.[0])} />
                  </label>
                )}
                <textarea className={styles.msgBox} rows={6} value={text} onChange={(e) => setText(e.target.value)} aria-label="Message" />
                <div className={v2.nsBtns}>
                  <a className={styles.actWa} href={whatsappHref(lead, text)} target="_blank" rel="noopener noreferrer" onClick={() => track('whatsapp', `WhatsApp « ${tpl.label} »`)}>
                    <Icon name="whatsapp" size={17} /> WhatsApp
                  </a>
                  <a className={styles.btnSecondary} href={smsHref(lead, text)} onClick={() => track('sms', `SMS « ${tpl.label} »`)}>
                    <Icon name="sms" size={17} /> SMS
                  </a>
                </div>
                <div className={v2.inlineLinks}>
                  {lead.email && (
                    <a className={styles.linkBtn} href={gmailHref(lead, emailSubject(lead), text)} target="_blank" rel="noopener noreferrer" onClick={() => track('email', `Email « ${tpl.label} »`)}>
                      <Icon name="mail" size={15} /> Gmail
                    </a>
                  )}
                  <button type="button" className={styles.linkBtn} onClick={() => navigator.clipboard?.writeText(text)}>
                    <Icon name="copy" size={15} /> Copier le texte
                  </button>
                  <button type="button" className={styles.linkBtn} onClick={() => navigator.clipboard?.writeText(lead.phone)}>
                    <Icon name="copy" size={15} /> Copier le n°
                  </button>
                </div>
              </>
            )}
          </section>
        )}

        {/* ---------- INFOS ---------- */}
        {tab === 'infos' && (
          <>
            <section className={styles.sheetSection}>
              <h3>Client</h3>
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
                <AddressAutocomplete
                  value={form.address}
                  onChange={(v) => {
                    set('address', v)
                    set('coords', null)
                  }}
                  onSelect={(it) => {
                    set('address', it.address || it.label)
                    if (it.city) set('city', it.city)
                    set('coords', it.lat != null ? { lat: it.lat, lng: it.lng } : null)
                  }}
                  placeholder="Tapez l'adresse, choisissez dans la liste"
                />
              </label>
              <label className={styles.field}>
                Notes
                <textarea rows={3} value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="État du véhicule, code portail, préférences…" />
              </label>
            </section>

            <section className={styles.sheetSection}>
              <h3>Véhicule &amp; prestation</h3>
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
                  Plaque
                  <input value={form.plate} onChange={(e) => set('plate', e.target.value.toUpperCase())} placeholder="AB-123-CD" maxLength={20} />
                </label>
              </div>
              <label className={styles.field}>
                Garage partenaire
                <select value={form.partner} onChange={(e) => set('partner', e.target.value)}>
                  <option value="">— Particulier —</option>
                  {partnerList(settings, allLeads).map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </label>
            </section>

            <section className={styles.sheetSection}>
              <h3>Rendez-vous &amp; relance</h3>
              <label className={styles.field}>
                Rendez-vous
                <input type="datetime-local" value={form.appointment_at} onChange={(e) => set('appointment_at', e.target.value)} />
              </label>
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
                Code parrain utilisé
                <input value={form.ref_code} onChange={(e) => set('ref_code', e.target.value.toUpperCase())} placeholder="Code d'un client qui l'a recommandé" maxLength={20} />
              </label>
              {form.appointment_at && lead.status !== 'reserve' && !['fait', 'avis_demande', 'avis_recu'].includes(lead.status) && (
                <button type="button" className={styles.linkBtn} onClick={() => setStatus('reserve')}>
                  → Passer en « Réservé »
                </button>
              )}
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
          </>
        )}

        {/* ---------- HISTORIQUE ---------- */}
        {tab === 'historique' && (
          <section className={styles.sheetSection}>
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
                  <br />
                  Origine : {originText(lead)}
                </p>
                <em>{formatDate(lead.created_at, { dateStyle: 'short', timeStyle: 'short' })}</em>
              </li>
            </ul>
          </section>
        )}

        {/* Modifications en cours : barre d'enregistrement toujours visible */}
        {dirty && (
          <div className={v2.lsSave}>
            <span>Modifications non enregistrées</span>
            <button type="button" className={styles.btnPrimary} onClick={save}>
              Enregistrer
            </button>
          </div>
        )}
        <div className={v2.lsBottom} />

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

// Modèles de messages rangés par moment.
const TPL_GROUPS = [
  { label: 'Prise de contact', ids: ['premier', 'injoignable', 'devis', 'relance-devis'] },
  { label: 'Rendez-vous', ids: ['confirmation', 'veille', 'en-route', 'meteo'] },
  { label: 'Après la prestation', ids: ['avis', 'relance-avis', 'parrainage', 'entretien'] },
]

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
    partner: f.partner || null,
    plate: f.plate.trim().toUpperCase() || null,
    ref_code: f.ref_code.trim().toUpperCase() || null,
  }
}
