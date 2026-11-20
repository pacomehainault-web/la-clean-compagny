'use client'

import { useMemo, useState } from 'react'
import styles from '../admin.module.css'
import { Icon } from './Icon'
import {
  addDays,
  startOfWeek,
  sameDay,
  formatTime,
  formatDayLabel,
  mapsHref,
  telHref,
  whatsappHref,
  templates,
  gcalHref,
  euros,
  startOfDay,
} from '../_lib/crm'

const DAY_NAMES = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

// Planning : semaine des rendez-vous + relances programmées.
export default function Planning({ leads, onOpen, logActivity }) {
  const [weekStart, setWeekStart] = useState(() => startOfWeek())
  const today = startOfDay()

  const booked = useMemo(
    () =>
      leads
        .filter((l) => l.appointment_at && l.status !== 'perdu')
        .sort((a, b) => (a.appointment_at > b.appointment_at ? 1 : -1)),
    [leads]
  )
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const weekEnd = addDays(weekStart, 7)
  const inWeek = booked.filter((l) => new Date(l.appointment_at) >= weekStart && new Date(l.appointment_at) < weekEnd)
  const weekValue = inWeek.reduce((s, l) => s + Number(l.quoted_price || 0), 0)
  const freeDays = days.filter((d) => d >= today && d.getDay() !== 0 && !inWeek.some((l) => sameDay(l.appointment_at, d)))

  const followups = leads
    .filter((l) => l.next_followup_at && !['perdu', 'avis_recu'].includes(l.status))
    .sort((a, b) => (a.next_followup_at > b.next_followup_at ? 1 : -1))
  const toPlace = leads.filter((l) => l.status === 'reserve' && !l.appointment_at)

  const label = `${weekStart.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} – ${addDays(weekStart, 6).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}`

  return (
    <div className={styles.stack}>
      <div className={styles.toolbar}>
        <div className={styles.segment} role="group" aria-label="Semaine">
          <button type="button" onClick={() => setWeekStart(addDays(weekStart, -7))} aria-label="Semaine précédente">
            <Icon name="left" size={16} />
          </button>
          <button type="button" className={styles.segOn} onClick={() => setWeekStart(startOfWeek())}>
            Cette semaine
          </button>
          <button type="button" onClick={() => setWeekStart(addDays(weekStart, 7))} aria-label="Semaine suivante">
            <Icon name="right" size={16} />
          </button>
        </div>
        <strong className={styles.weekLabel}>{label}</strong>
        <span className={styles.weekMeta}>
          {inWeek.length} RDV{weekValue ? ` · ${euros(weekValue)} prévus` : ''}
          {freeDays.length ? ` · ${freeDays.length} jour${freeDays.length > 1 ? 's' : ''} libre${freeDays.length > 1 ? 's' : ''}` : ''}
        </span>
      </div>

      <div className={styles.week}>
        {days.map((d, i) => {
          const items = inWeek.filter((l) => sameDay(l.appointment_at, d))
          const isToday = sameDay(d, today)
          return (
            <section
              key={d.toISOString()}
              className={`${styles.weekDay} ${isToday ? styles.weekToday : ''} ${d < today ? styles.weekPast : ''}`}
            >
              <h3>
                {DAY_NAMES[i]} <span>{d.getDate()}</span>
              </h3>
              {items.length === 0 ? (
                <p className={styles.weekFree}>{d < today ? '—' : 'Libre'}</p>
              ) : (
                items.map((l) => {
                  const tpl = templates(l).find((t) => t.id === 'veille')
                  const maps = mapsHref(l)
                  return (
                    <div key={l.id} className={styles.rdv}>
                      <button type="button" className={styles.rdvMain} onClick={() => onOpen(l.id)}>
                        <em>{formatTime(l.appointment_at)}</em>
                        <strong>{l.first_name}</strong>
                        <span>{[l.service, l.city].filter(Boolean).join(' · ')}</span>
                        {l.quoted_price ? <span>{euros(l.quoted_price)}</span> : null}
                      </button>
                      <div className={styles.rdvActs}>
                        <a className={styles.iconBtnSm2} href={telHref(l)} aria-label={`Appeler ${l.first_name}`}>
                          <Icon name="phone" size={15} />
                        </a>
                        <a
                          className={styles.iconBtnSm2}
                          href={whatsappHref(l, tpl.text)}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Rappel de la veille sur WhatsApp"
                          onClick={() => logActivity(l.id, 'whatsapp', 'WhatsApp « Rappel la veille »')}
                        >
                          <Icon name="whatsapp" size={15} />
                        </a>
                        {maps && (
                          <a className={styles.iconBtnSm2} href={maps} target="_blank" rel="noopener noreferrer" aria-label="Itinéraire">
                            <Icon name="map" size={15} />
                          </a>
                        )}
                        <a
                          className={styles.iconBtnSm2}
                          href={gcalHref(l)}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Ajouter à Google Agenda"
                        >
                          <Icon name="calendar" size={15} />
                        </a>
                      </div>
                    </div>
                  )
                })
              )}
            </section>
          )
        })}
      </div>

      <div className={styles.twoCols}>
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
                    <span className={`${styles.miniWhen} ${new Date(l.next_followup_at) < today ? styles.textDanger : ''}`}>
                      {formatDayLabel(l.next_followup_at)}
                    </span>
                    <strong>{l.first_name}</strong>
                    <span>{l.service || l.city || ''}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h2>Réservés sans date</h2>
            <span className={styles.count}>{toPlace.length}</span>
          </div>
          {toPlace.length === 0 ? (
            <p className={styles.empty}>Tous les clients réservés ont une date.</p>
          ) : (
            <ul className={styles.miniList}>
              {toPlace.map((l) => (
                <li key={l.id}>
                  <button type="button" onClick={() => onOpen(l.id)}>
                    <span className={styles.miniWhen}>À placer</span>
                    <strong>{l.first_name}</strong>
                    <span>{l.service || ''}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
