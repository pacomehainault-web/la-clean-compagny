'use client'

import { useState } from 'react'
import styles from '../admin.module.css'
import v2 from '../v2.module.css'
import { Icon } from './Icon'
import { euros, euros2, monthRange, formatDate } from '../_lib/crm'

export const DEFAULT_PARTNERS = ['BMW Angers', 'GR Motors']

export function partnerList(settings, leads = []) {
  const set = new Set([...(settings?.business?.partners || DEFAULT_PARTNERS), ...leads.map((l) => l.partner).filter(Boolean)])
  return [...set]
}

// Garages partenaires : véhicules traités par mois, facture groupée.
export default function Partners({ leads, jobs, docs, settings, onSaveSettings, onCreateInvoice, onAddVehicle, onOpen }) {
  const now = new Date()
  const partners = partnerList(settings, leads)
  const [current, setCurrent] = useState(partners[0] || '')
  const [ym, setYm] = useState({ y: now.getFullYear(), m: now.getMonth() })
  const [newName, setNewName] = useState('')
  const { from, to } = monthRange(ym.y, ym.m)
  const label = new Date(ym.y, ym.m, 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  const shift = (n) => {
    const d = new Date(ym.y, ym.m + n, 1)
    setYm({ y: d.getFullYear(), m: d.getMonth() })
  }
  const leadOf = (id) => leads.find((l) => l.id === id)
  const pJobs = jobs
    .filter((j) => (j.partner || leadOf(j.lead_id)?.partner) === current && j.done_at >= from && j.done_at <= to)
    .sort((a, b) => (a.done_at > b.done_at ? 1 : -1))
  const total = pJobs.reduce((t, j) => t + Number(j.amount || 0), 0)
  const upcoming = leads.filter((l) => l.partner === current && l.status === 'reserve' && l.appointment_at && new Date(l.appointment_at) >= now)
  const invoiced = docs.find((d) => d.kind === 'facture' && d.client?.name === current && d.notes?.includes(label))
  const yearTotal = jobs.filter((j) => (j.partner || leadOf(j.lead_id)?.partner) === current && j.done_at?.startsWith(String(ym.y))).reduce((t, j) => t + Number(j.amount || 0), 0)

  async function addPartner(e) {
    e.preventDefault()
    const n = newName.trim()
    if (!n || partners.includes(n)) return
    await onSaveSettings({ business: { ...(settings?.business || {}), partners: [...partners, n] } })
    setCurrent(n)
    setNewName('')
  }

  function invoice() {
    const lines = pJobs.map((j) => {
      const l = leadOf(j.lead_id)
      return {
        label: `${formatDate(j.done_at, { day: '2-digit', month: '2-digit' })} · ${j.service}${j.plate || l?.plate ? ` · ${j.plate || l.plate}` : ''}${l?.vehicle ? ` · ${l.vehicle}` : ''}`,
        qty: 1,
        unit_price: Number(j.amount) || 0,
      }
    })
    onCreateInvoice(current, lines, `Prestations ${label}`)
  }

  return (
    <div className={styles.stack}>
      <div className={styles.toolbar}>
        <div className={`${styles.segment} ${v2.scrollSeg}`} role="tablist" aria-label="Garage">
          {partners.map((p) => (
            <button type="button" key={p} role="tab" aria-selected={current === p} className={current === p ? styles.segOn : ''} onClick={() => setCurrent(p)}>
              {p}
            </button>
          ))}
        </div>
        <div className={styles.segment} role="group" aria-label="Mois">
          <button type="button" onClick={() => shift(-1)} aria-label="Mois précédent">
            <Icon name="left" size={16} />
          </button>
          <button type="button" className={styles.segOn} onClick={() => setYm({ y: now.getFullYear(), m: now.getMonth() })}>
            {label.replace(/^./, (c) => c.toUpperCase())}
          </button>
          <button type="button" onClick={() => shift(1)} aria-label="Mois suivant">
            <Icon name="right" size={16} />
          </button>
        </div>
      </div>

      <div className={styles.cashKpis}>
        <div className={`${styles.cashKpi} ${styles.cashKpiMain}`}>
          <span>{current} · ce mois</span>
          <strong>{euros(total)}</strong>
          <em>
            {pJobs.length} véhicule{pJobs.length > 1 ? 's' : ''}
          </em>
        </div>
        <div className={styles.cashKpi}>
          <span>Depuis janvier</span>
          <strong>{euros(yearTotal)}</strong>
          <em>{ym.y}</em>
        </div>
        <div className={styles.cashKpi}>
          <span>Véhicules à venir</span>
          <strong>{upcoming.length}</strong>
          <em>déjà planifiés</em>
        </div>
      </div>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <h2>Véhicules traités</h2>
          <div className={styles.rowBtns}>
            <button type="button" className={styles.btnSecondary} onClick={() => onAddVehicle(current)}>
              <Icon name="plus" size={16} /> Véhicule
            </button>
            {pJobs.length > 0 &&
              (invoiced ? (
                <span className={styles.hint}>Facture {invoiced.number} déjà créée</span>
              ) : (
                <button type="button" className={styles.btnPrimary} onClick={invoice}>
                  <Icon name="file" size={16} /> Facture du mois
                </button>
              ))}
          </div>
        </div>
        {pJobs.length === 0 ? (
          <p className={styles.empty}>Aucun véhicule ce mois-ci. Ajoutez-en avec « + Véhicule » (ou cochez le garage en créant un RDV) : ils s&apos;additionnent ici pour la facture groupée.</p>
        ) : (
          <ul className={v2.rowsList}>
            {pJobs.map((j) => {
              const l = leadOf(j.lead_id)
              return (
                <li key={j.id}>
                  <button type="button" className={v2.rowMain} onClick={() => l && onOpen(l.id)}>
                    <strong>
                      {j.plate || l?.plate || 'Sans plaque'} {l?.vehicle ? `· ${l.vehicle}` : ''}
                    </strong>
                    <span>
                      {formatDate(j.done_at)} · {j.service}
                    </span>
                  </button>
                  <strong>{euros2(j.amount)}</strong>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <form className={styles.panel} onSubmit={addPartner}>
        <div className={styles.panelHead}>
          <h2>Nouveau partenaire</h2>
        </div>
        <div className={styles.noteRow}>
          <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Ex. Garage Renault Avrillé, concession, loueur…" />
          <button type="submit" className={styles.btnSecondary}>
            Ajouter
          </button>
        </div>
        <p className={styles.hint}>Montrez cet écran aux concessions que vous démarchez : suivi par plaque et facture mensuelle unique, c&apos;est exactement ce qu&apos;elles veulent.</p>
      </form>
    </div>
  )
}
