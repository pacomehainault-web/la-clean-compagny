'use client'

import styles from '../admin.module.css'
import { Icon } from './Icon'
import { addDays, formatDayLabel, formatTime, startOfDay, mapsHref, telHref, whatsappHref, templates, euros } from '../_lib/crm'

export default function Agenda({ leads, onOpen, logActivity }) {
  const today = startOfDay()
  const booked = leads
    .filter((l) => l.appointment_at && ['reserve', 'fait', 'avis_demande', 'avis_recu'].includes(l.status))
    .sort((a, b) => (a.appointment_at > b.appointment_at ? 1 : -1))
  const upcoming = booked.filter((l) => new Date(l.appointment_at) >= today)
  const past = booked.filter((l) => new Date(l.appointment_at) < today && new Date(l.appointment_at) >= addDays(today, -14)).reverse()
  const followups = leads
    .filter((l) => l.next_followup_at && l.status !== 'perdu')
    .sort((a, b) => (a.next_followup_at > b.next_followup_at ? 1 : -1))

  const groups = []
  for (const l of upcoming) {
    const key = startOfDay(l.appointment_at).toISOString()
    const g = groups.find((x) => x.key === key)
    if (g) g.items.push(l)
    else groups.push({ key, label: formatDayLabel(l.appointment_at), items: [l] })
  }

  return (
    <div className={styles.stack}>
      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <h2>Rendez-vous à venir</h2>
          <span className={styles.count}>{upcoming.length}</span>
        </div>
        {groups.length === 0 && (
          <p className={styles.empty}>
            Aucun RDV. Pour en programmer un : ouvrez une fiche, renseignez « Rendez-vous » et passez-la en « Réservé ».
          </p>
        )}
        {groups.map((g) => (
          <div key={g.key} className={styles.dayGroup}>
            <h3>{g.label}</h3>
            {g.items.map((l) => {
              const maps = mapsHref(l)
              const veille = templates(l).find((t) => t.id === 'veille')
              return (
                <div key={l.id} className={styles.agendaRow}>
                  <span className={styles.agendaTime}>{formatTime(l.appointment_at)}</span>
                  <button type="button" className={styles.agendaMain} onClick={() => onOpen(l.id)}>
                    <strong>{l.first_name}</strong>
                    <span>{[l.service, l.vehicle].filter(Boolean).join(' · ')}</span>
                    <span>{[l.address, l.city].filter(Boolean).join(', ')}</span>
                    {l.quoted_price ? <span>{euros(l.quoted_price)}</span> : null}
                  </button>
                  <div className={styles.agendaActs}>
                    {maps && (
                      <a className={styles.iconBtn} href={maps} target="_blank" rel="noopener noreferrer" aria-label="Itinéraire">
                        <Icon name="map" />
                      </a>
                    )}
                    <a className={styles.iconBtn} href={telHref(l)} aria-label="Appeler">
                      <Icon name="phone" />
                    </a>
                    <a
                      className={styles.iconBtn}
                      href={whatsappHref(l, veille.text)}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Envoyer le rappel WhatsApp"
                      onClick={() => logActivity(l.id, 'whatsapp', 'Rappel de RDV envoyé')}
                    >
                      <Icon name="whatsapp" />
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <h2>Relances programmées</h2>
          <span className={styles.count}>{followups.length}</span>
        </div>
        {followups.length === 0 ? (
          <p className={styles.empty}>Aucune relance programmée. Dans une fiche, choisissez « Relancer le… ».</p>
        ) : (
          <ul className={styles.miniList}>
            {followups.map((l) => (
              <li key={l.id}>
                <button type="button" onClick={() => onOpen(l.id)}>
                  <span className={styles.miniWhen}>{formatDayLabel(l.next_followup_at)}</span>
                  <strong>{l.first_name}</strong>
                  <span>{[l.service, l.city].filter(Boolean).join(' · ')}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {past.length > 0 && (
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h2>Ces 14 derniers jours</h2>
          </div>
          <ul className={styles.miniList}>
            {past.map((l) => (
              <li key={l.id}>
                <button type="button" onClick={() => onOpen(l.id)}>
                  <span className={styles.miniWhen}>{formatDayLabel(l.appointment_at)}</span>
                  <strong>{l.first_name}</strong>
                  <span>{l.status === 'reserve' ? '⚠️ À marquer comme fait' : [l.service, l.city].filter(Boolean).join(' · ')}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
