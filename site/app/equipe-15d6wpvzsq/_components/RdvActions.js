'use client'

import { useState } from 'react'
import styles from '../admin.module.css'
import { Icon } from './Icon'
import SlotPicker from './SlotPicker'
import { PAYMENT_METHODS, atTime, hhmm, startOfDay, durationH, euros, templates, whatsappHref, smsHref } from '../_lib/crm'

// « Terminé » : enregistre la prestation, l'encaissement et propose la demande d'avis.
export function CompleteRdv({ lead, onClose, onComplete, onAskedReview }) {
  const [amount, setAmount] = useState(lead.quoted_price ?? '')
  const [method, setMethod] = useState('cb')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    const ok = await onComplete(lead, { amount: Number(amount) || 0, payment_method: method })
    setBusy(false)
    if (ok) setDone(true)
  }

  const avis = templates(lead).find((t) => t.id === 'avis')

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Prestation terminée">
      <button type="button" className={styles.backdrop} onClick={onClose} aria-label="Fermer" />
      <div className={`${styles.sheet} ${styles.sheetSmall}`}>
        <header className={styles.sheetHead}>
          <div>
            <h2>{done ? 'Bien joué !' : 'Prestation terminée'}</h2>
            <p>
              {lead.first_name}
              {lead.service ? ` · ${lead.service}` : ''}
            </p>
          </div>
          <button type="button" className={styles.iconBtn} onClick={onClose} aria-label="Fermer">
            <Icon name="close" />
          </button>
        </header>
        {done ? (
          <section className={styles.sheetSection}>
            <p className={styles.okText}>
              {euros(amount)} enregistrés{method === 'a_encaisser' ? ' (à encaisser)' : ''}. C&apos;est le meilleur moment pour demander l&apos;avis Google :
            </p>
            <div className={styles.doneActions}>
              <a className={styles.actWa} href={whatsappHref(lead, avis.text)} target="_blank" rel="noopener noreferrer" onClick={() => onAskedReview?.(lead)}>
                <Icon name="whatsapp" size={18} /> Demander l&apos;avis (WhatsApp)
              </a>
              <a className={styles.btnSecondary} href={smsHref(lead, avis.text)} onClick={() => onAskedReview?.(lead)}>
                <Icon name="sms" size={18} /> Par SMS
              </a>
            </div>
            <div className={styles.rowBtns}>
              <button type="button" className={styles.btnPrimary} onClick={onClose}>
                Fermer
              </button>
            </div>
          </section>
        ) : (
          <form onSubmit={submit}>
            <section className={styles.sheetSection}>
              <label className={styles.field}>
                Montant encaissé (€)
                <input type="number" min="0" step="0.01" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} required autoFocus />
              </label>
              <div className={styles.slotLabel}>Paiement</div>
              <div className={styles.chipsWrap}>
                {PAYMENT_METHODS.map((p) => (
                  <button type="button" key={p.id} className={`${styles.chip} ${method === p.id ? styles.chipOn : ''}`} onClick={() => setMethod(p.id)}>
                    {p.label}
                  </button>
                ))}
              </div>
            </section>
            <div className={styles.sheetFoot}>
              <button type="submit" className={`${styles.btnPrimary} ${styles.btnBlock}`} disabled={busy}>
                <Icon name="check" size={18} /> {busy ? 'Enregistrement…' : 'Valider la prestation'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

// « Décaler » : nouveau jour / heure, puis message au client.
export function MoveRdv({ lead, leads, onClose, onMove }) {
  const start = new Date(lead.appointment_at)
  const [slot, setSlot] = useState({ day: startOfDay(start), time: hhmm(start), minutes: Math.round(durationH(lead) * 60) })
  const [busy, setBusy] = useState(false)
  const [moved, setMoved] = useState(null)

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    const at = atTime(slot.day, slot.time).toISOString()
    const ok = await onMove(lead, { appointment_at: at, duration_min: slot.minutes })
    setBusy(false)
    if (ok) setMoved({ ...lead, appointment_at: at })
  }

  const tpl = moved ? templates(moved).find((t) => t.id === 'confirmation') : null
  const text = tpl ? tpl.text.replace("c'est confirmé pour", 'petit changement : on se voit') : ''

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Décaler le rendez-vous">
      <button type="button" className={styles.backdrop} onClick={onClose} aria-label="Fermer" />
      <div className={`${styles.sheet} ${styles.sheetSmall} ${styles.sheetWide}`}>
        <header className={styles.sheetHead}>
          <div>
            <h2>Décaler le RDV</h2>
            <p>
              {lead.first_name} · actuellement {start.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })} à {hhmm(start).replace(':', 'h')}
            </p>
          </div>
          <button type="button" className={styles.iconBtn} onClick={onClose} aria-label="Fermer">
            <Icon name="close" />
          </button>
        </header>
        {moved ? (
          <section className={styles.sheetSection}>
            <p className={styles.okText}>RDV déplacé. Prévenez le client :</p>
            <div className={styles.doneActions}>
              <a className={styles.actWa} href={whatsappHref(moved, text)} target="_blank" rel="noopener noreferrer">
                <Icon name="whatsapp" size={18} /> WhatsApp
              </a>
              <a className={styles.btnSecondary} href={smsHref(moved, text)}>
                <Icon name="sms" size={18} /> SMS
              </a>
            </div>
            <div className={styles.rowBtns}>
              <button type="button" className={styles.btnPrimary} onClick={onClose}>
                Fermer
              </button>
            </div>
          </section>
        ) : (
          <form onSubmit={submit}>
            <section className={styles.sheetSection}>
              <SlotPicker leads={leads} value={slot} onChange={setSlot} excludeId={lead.id} />
            </section>
            <div className={styles.sheetFoot}>
              <button type="submit" className={`${styles.btnPrimary} ${styles.btnBlock}`} disabled={busy || !slot.time}>
                {busy ? 'Enregistrement…' : 'Déplacer le RDV'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
