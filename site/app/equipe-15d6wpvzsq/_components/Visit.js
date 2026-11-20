'use client'

import { useEffect, useRef, useState } from 'react'
import styles from '../admin.module.css'
import v2 from '../v2.module.css'
import { Icon } from './Icon'
import { checklistFor, isOutdoor, durationH, formatTime, templates, whatsappHref, toDateInput, trackUrl, mapsHref, wazeHref } from '../_lib/crm'
import { uploadPhoto, deletePhoto, photoUrl, compressImage } from '../_lib/media'
import { slotRain } from '../_lib/geo'

const TABS = [
  { id: 'check', label: 'Checklist', icon: 'check' },
  { id: 'photos', label: 'Photos', icon: 'camera' },
  { id: 'etat', label: 'État des lieux', icon: 'pen' },
]

// Fiche d'intervention sur place : checklist, photos avant/après, état des lieux signé.
export default function Visit({ lead, photos, supabase, fc, onClose, updateLead, onPhotos, onGo, onComplete, flash, logActivity }) {
  const [tab, setTab] = useState('check')
  const visitDay = toDateInput(lead.appointment_at || new Date().toISOString())
  const mine = photos.filter((p) => p.lead_id === lead.id)
  const today = mine.filter((p) => p.taken_on === visitDay)
  const rain = isOutdoor(lead.service) ? slotRain(fc, lead.appointment_at, durationH(lead) * 60) : null

  // Checklist propre à ce RDV (remise à zéro à chaque nouvelle date).
  const items = checklistFor(lead.service)
  const saved = lead.checklist?.day === visitDay ? lead.checklist.done || {} : {}
  const [done, setDone] = useState(saved)
  const count = items.filter((i) => done[i]).length

  function toggle(item) {
    const next = { ...done, [item]: !done[item] }
    setDone(next)
    updateLead(lead, { checklist: { day: visitDay, done: next } }, { silent: true })
  }

  const stageLabel = { en_route: 'En route', sur_place: 'Sur place', termine: 'Terminé' }[lead.track_stage] || 'Pas encore parti'

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label={`Intervention chez ${lead.first_name}`}>
      <button type="button" className={styles.backdrop} onClick={onClose} aria-label="Fermer" />
      <div className={`${styles.sheet} ${styles.sheetSmall} ${styles.sheetWide}`}>
        <header className={styles.sheetHead}>
          <div>
            <h2>Intervention · {lead.first_name}</h2>
            <p>
              {[lead.service, lead.vehicle, lead.appointment_at ? formatTime(lead.appointment_at) : null].filter(Boolean).join(' · ')} · <strong>{stageLabel}</strong>
            </p>
          </div>
          <button type="button" className={styles.iconBtn} onClick={onClose} aria-label="Fermer">
            <Icon name="close" />
          </button>
        </header>

        <section className={styles.sheetSection}>
          <div className={v2.visitBar}>
            {lead.track_stage !== 'sur_place' && lead.track_stage !== 'termine' && (
              <button type="button" className={styles.btnPrimary} onClick={() => onGo(lead)}>
                <Icon name="car" size={17} /> {lead.track_stage === 'en_route' ? 'Je suis arrivé' : 'Je pars'}
              </button>
            )}
            {lead.status === 'reserve' && (
              <button type="button" className={styles.btnSecondary} onClick={() => onComplete(lead)}>
                <Icon name="check" size={17} /> Terminé
              </button>
            )}
            {wazeHref(lead) && (
              <a className={styles.btnSecondary} href={wazeHref(lead)} target="_blank" rel="noopener noreferrer">
                <Icon name="map" size={17} /> Waze
              </a>
            )}
            {mapsHref(lead) && (
              <a className={styles.btnSecondary} href={mapsHref(lead)} target="_blank" rel="noopener noreferrer">
                <Icon name="map" size={17} /> Maps
              </a>
            )}
            <a className={styles.btnSecondary} href={trackUrl(lead)} target="_blank" rel="noopener noreferrer">
              <Icon name="eye" size={17} /> Page client
            </a>
          </div>
          {rain && rain.prob >= 40 && (
            <p className={v2.rainWarn}>
              🌧️ Pluie {rain.prob} %{rain.mm ? ` (${rain.mm} mm)` : ''} pendant le créneau.{' '}
              <a href={whatsappHref(lead, templates(lead).find((t) => t.id === 'meteo').text)} target="_blank" rel="noopener noreferrer" onClick={() => logActivity?.(lead.id, 'whatsapp', 'Alerte météo envoyée')}>
                Prévenir le client
              </a>
            </p>
          )}
          <div className={styles.segment} role="tablist">
            {TABS.map((t) => (
              <button type="button" role="tab" aria-selected={tab === t.id} key={t.id} className={tab === t.id ? styles.segOn : ''} onClick={() => setTab(t.id)}>
                <Icon name={t.icon} size={15} /> {t.label}
                {t.id === 'check' ? ` ${count}/${items.length}` : t.id === 'photos' ? ` ${today.filter((p) => p.kind === 'avant' || p.kind === 'apres').length}` : ''}
              </button>
            ))}
          </div>
        </section>

        {tab === 'check' && (
          <section className={styles.sheetSection}>
            <div className={v2.progressBar} aria-hidden="true">
              <i style={{ width: `${(count / items.length) * 100}%` }} />
            </div>
            <ul className={v2.checklist}>
              {items.map((item) => (
                <li key={item}>
                  <button type="button" className={done[item] ? v2.checkOn : ''} onClick={() => toggle(item)} aria-pressed={Boolean(done[item])}>
                    <span>{done[item] ? <Icon name="check" size={16} /> : null}</span>
                    {item}
                  </button>
                </li>
              ))}
            </ul>
            {count === items.length && <p className={styles.okText}>Tout est fait 👌 Il reste à valider la prestation.</p>}
          </section>
        )}

        {tab === 'photos' && (
          <section className={styles.sheetSection}>
            <div className={v2.photoCols}>
              {['avant', 'apres'].map((kind) => (
                <PhotoColumn
                  key={kind}
                  kind={kind}
                  label={kind === 'avant' ? 'Avant' : 'Après'}
                  photos={today.filter((p) => p.kind === kind)}
                  lead={lead}
                  supabase={supabase}
                  takenOn={visitDay}
                  onPhotos={onPhotos}
                  flash={flash}
                />
              ))}
            </div>
            <p className={styles.hint}>Prenez les photos « avant » et « après » sous le même angle et dans le même ordre : le client les compare avec un curseur sur sa page. Elles servent aussi au récap Instagram de la semaine.</p>
          </section>
        )}

        {tab === 'etat' && <Inspection lead={lead} photos={today.filter((p) => p.kind === 'etat' || p.kind === 'signature')} supabase={supabase} visitDay={visitDay} updateLead={updateLead} onPhotos={onPhotos} flash={flash} />}
      </div>
    </div>
  )
}

function PhotoColumn({ kind, label, photos, lead, supabase, takenOn, onPhotos, flash }) {
  const [busy, setBusy] = useState(0)
  const input = useRef(null)

  async function add(files) {
    const list = [...files].slice(0, 12)
    setBusy(list.length)
    const added = []
    for (const f of list) {
      try {
        added.push(await uploadPhoto(supabase, { leadId: lead.id, kind, file: f, takenOn }))
      } catch {
        flash?.("Une photo n'a pas pu être envoyée")
      }
      setBusy((n) => n - 1)
    }
    if (added.length) onPhotos({ add: added })
    if (input.current) input.current.value = ''
  }

  async function remove(p) {
    if (!window.confirm('Supprimer cette photo ?')) return
    try {
      await deletePhoto(supabase, p)
      onPhotos({ remove: p.id })
    } catch {
      flash?.('Suppression impossible')
    }
  }

  return (
    <div className={v2.photoCol}>
      <div className={v2.photoHead}>
        <strong>{label}</strong>
        <span>{photos.length}</span>
      </div>
      <div className={v2.thumbs}>
        {photos.map((p, i) => (
          <figure key={p.id} className={v2.thumb}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photoUrl(p.path)} alt={`${label} ${i + 1}`} loading="lazy" />
            <figcaption>{i + 1}</figcaption>
            <button type="button" onClick={() => remove(p)} aria-label="Supprimer la photo">
              <Icon name="close" size={14} />
            </button>
          </figure>
        ))}
        <label className={v2.addPhoto}>
          <Icon name="camera" size={22} />
          <span>{busy ? `Envoi… (${busy})` : 'Ajouter'}</span>
          <input ref={input} type="file" accept="image/*" multiple onChange={(e) => e.target.files?.length && add(e.target.files)} disabled={busy > 0} />
        </label>
      </div>
    </div>
  )
}

function Inspection({ lead, photos, supabase, visitDay, updateLead, onPhotos, flash }) {
  const insp = lead.inspection?.day === visitDay ? lead.inspection : {}
  const [notes, setNotes] = useState(insp.notes || '')
  const [savedNotes, setSavedNotes] = useState(insp.notes || '')
  const signature = photos.find((p) => p.kind === 'signature')
  const etat = photos.filter((p) => p.kind === 'etat')
  const [signing, setSigning] = useState(false)

  async function saveNotes() {
    await updateLead(lead, { inspection: { ...insp, day: visitDay, notes } }, { silent: true })
    setSavedNotes(notes)
    flash?.('État des lieux enregistré')
  }

  async function saveSignature(blob) {
    try {
      const row = await uploadPhoto(supabase, { leadId: lead.id, kind: 'signature', file: blob, takenOn: visitDay, alreadyCompressed: true, caption: notes || null })
      onPhotos({ add: [row] })
      await updateLead(lead, { inspection: { ...insp, day: visitDay, notes, signed_at: new Date().toISOString() } }, { silent: true })
      setSavedNotes(notes)
      setSigning(false)
      flash?.('Signé par le client ✔')
    } catch {
      flash?.("La signature n'a pas pu être enregistrée")
    }
  }

  return (
    <section className={styles.sheetSection}>
      <p className={styles.hint}>À faire à l&apos;arrivée, avant de commencer : photographiez les défauts déjà présents (rayures, taches, jantes) et faites signer le client. En cas de litige, vous êtes couvert.</p>
      <PhotoColumn kind="etat" label="Défauts constatés" photos={etat} lead={lead} supabase={supabase} takenOn={visitDay} onPhotos={onPhotos} flash={flash} />
      <label className={styles.field}>
        Remarques
        <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ex. rayure aile AR gauche, tache siège passager, jante AV droite frottée…" />
      </label>
      {notes !== savedNotes && (
        <button type="button" className={styles.btnSecondary} onClick={saveNotes}>
          Enregistrer les remarques
        </button>
      )}
      {signature && !signing ? (
        <div className={v2.signed}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photoUrl(signature.path)} alt="Signature du client" />
          <span>
            Signé par {lead.first_name}
            {insp.signed_at ? ` à ${formatTime(insp.signed_at)}` : ''}
          </span>
          <button type="button" className={styles.linkBtn} onClick={() => setSigning(true)}>
            Refaire
          </button>
        </div>
      ) : signing ? (
        <SignaturePad name={lead.first_name} onCancel={() => setSigning(false)} onSave={saveSignature} />
      ) : (
        <button type="button" className={`${styles.btnPrimary} ${styles.btnBlock}`} onClick={() => setSigning(true)}>
          <Icon name="pen" size={17} /> Faire signer le client
        </button>
      )}
    </section>
  )
}

function SignaturePad({ name, onSave, onCancel }) {
  const canvas = useRef(null)
  const drawing = useRef(false)
  const [empty, setEmpty] = useState(true)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const c = canvas.current
    const ratio = window.devicePixelRatio || 1
    const rect = c.getBoundingClientRect()
    c.width = rect.width * ratio
    c.height = rect.height * ratio
    const ctx = c.getContext('2d')
    ctx.scale(ratio, ratio)
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, rect.width, rect.height)
    ctx.lineWidth = 2.4
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = '#0f1b33'
  }, [])

  function pos(e) {
    const r = canvas.current.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }
  function down(e) {
    e.preventDefault()
    try {
      canvas.current.setPointerCapture(e.pointerId)
    } catch {}
    drawing.current = true
    const ctx = canvas.current.getContext('2d')
    const p = pos(e)
    ctx.beginPath()
    ctx.moveTo(p.x, p.y)
  }
  function move(e) {
    if (!drawing.current) return
    const ctx = canvas.current.getContext('2d')
    const p = pos(e)
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
    setEmpty(false)
  }
  function up() {
    drawing.current = false
  }
  function clear() {
    const c = canvas.current
    const ctx = c.getContext('2d')
    const r = c.getBoundingClientRect()
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, r.width, r.height)
    setEmpty(true)
  }
  async function save() {
    setBusy(true)
    const c = canvas.current
    const ctx = c.getContext('2d')
    const r = c.getBoundingClientRect()
    ctx.fillStyle = '#556074'
    ctx.font = '12px system-ui, sans-serif'
    ctx.fillText(`${name} · ${new Date().toLocaleString('fr-FR')} · état des lieux accepté`, 10, r.height - 10)
    const blob = await new Promise((res) => c.toBlob(res, 'image/png'))
    const small = blob.size > 600000 ? await compressImage(blob, 1200, 0.9) : blob
    await onSave(small)
    setBusy(false)
  }

  return (
    <div className={v2.sign}>
      <p className={styles.hint}>
        « Je confirme l&apos;état du véhicule constaté avant la prestation. » — {name}
      </p>
      <canvas ref={canvas} className={v2.signCanvas} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} aria-label="Zone de signature" />
      <div className={styles.rowBtns}>
        <button type="button" className={styles.btnSecondary} onClick={onCancel}>
          Annuler
        </button>
        <button type="button" className={styles.btnSecondary} onClick={clear} disabled={empty}>
          Effacer
        </button>
        <button type="button" className={styles.btnPrimary} onClick={save} disabled={empty || busy}>
          {busy ? 'Envoi…' : 'Valider la signature'}
        </button>
      </div>
    </div>
  )
}
