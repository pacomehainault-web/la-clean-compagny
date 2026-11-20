'use client'

import { useState } from 'react'
import styles from '../admin.module.css'
import { Icon } from './Icon'
import { SERVICES, SOURCES } from '../_lib/crm'

// Ajout manuel d'un prospect (appel entrant, Instagram, bouche-à-oreille…).
export default function AddLead({ onClose, onSave }) {
  const [busy, setBusy] = useState(false)
  const manualSources = SOURCES.filter((s) => !s.id.startsWith('accueil') && !s.id.startsWith('devis'))

  async function submit(e) {
    e.preventDefault()
    const d = new FormData(e.currentTarget)
    setBusy(true)
    await onSave({
      first_name: String(d.get('first_name') || '').trim() || 'Sans nom',
      phone: String(d.get('phone') || '').trim(),
      city: String(d.get('city') || '').trim() || null,
      vehicle: String(d.get('vehicle') || '').trim() || null,
      service: String(d.get('service') || '').trim() || null,
      source: String(d.get('source') || 'autre'),
      notes: String(d.get('notes') || '').trim() || null,
      status: 'nouveau',
    })
    setBusy(false)
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Ajouter un prospect">
      <button type="button" className={styles.backdrop} onClick={onClose} aria-label="Fermer" />
      <form className={`${styles.sheet} ${styles.sheetSmall}`} onSubmit={submit}>
        <header className={styles.sheetHead}>
          <div>
            <h2>Nouveau prospect</h2>
            <p>Appel entrant, Instagram, bouche-à-oreille…</p>
          </div>
          <button type="button" className={styles.iconBtn} onClick={onClose} aria-label="Fermer">
            <Icon name="close" />
          </button>
        </header>
        <section className={styles.sheetSection}>
          <div className={styles.grid2}>
            <label className={styles.field}>
              Prénom / nom *
              <input name="first_name" required autoFocus />
            </label>
            <label className={styles.field}>
              Téléphone *
              <input name="phone" type="tel" required minLength={6} />
            </label>
            <label className={styles.field}>
              Ville
              <input name="city" />
            </label>
            <label className={styles.field}>
              Véhicule
              <input name="vehicle" placeholder="Ex. Clio 5" />
            </label>
          </div>
          <label className={styles.field}>
            Prestation
            <input name="service" list="add-services" />
            <datalist id="add-services">
              {SERVICES.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </label>
          <label className={styles.field}>
            D&apos;où vient-il ?
            <select name="source" defaultValue="telephone">
              {manualSources.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.field}>
            Notes
            <textarea name="notes" rows={3} />
          </label>
          <div className={styles.rowBtns}>
            <button type="button" className={styles.btnSecondary} onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className={styles.btnPrimary} disabled={busy}>
              {busy ? 'Ajout…' : 'Ajouter'}
            </button>
          </div>
        </section>
      </form>
    </div>
  )
}
