'use client'

import { useMemo, useState } from 'react'
import styles from '../admin.module.css'
import { Icon } from './Icon'
import Tournee from './Tournee'
import v2 from '../v2.module.css'
import { slotRain } from '../_lib/geo'
import {
  isOutdoor,
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
  durationH,
  formatDuration,
  freeStarts,
  hhmm,
  CLIENT_STATUSES,
  WORK_START,
  WORK_END,
} from '../_lib/crm'

const DAY_NAMES = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

function RdvCard({ l, onOpen, logActivity, onComplete, onMove, onGo, onVisit, fc, large = false }) {
  const done = CLIENT_STATUSES.includes(l.status)
  const rain = !done && isOutdoor(l.service) ? slotRain(fc, l.appointment_at, durationH(l) * 60) : null
  const isToday = sameDay(l.appointment_at, new Date())
  const isPast = new Date(l.appointment_at) < new Date()
  const tpl = templates(l).find((t) => t.id === (isPast ? 'avis' : 'veille'))
  const maps = mapsHref(l)
  const end = new Date(new Date(l.appointment_at).getTime() + durationH(l) * 3600000)
  return (
    <div className={`${styles.rdv} ${done ? styles.rdvDone : ''} ${large ? styles.rdvLarge : ''}`}>
      <button type="button" className={styles.rdvMain} onClick={() => onOpen(l.id)}>
        <em>
          {formatTime(l.appointment_at)}
          {large ? ` – ${formatTime(end)}` : ''}
          {done ? ' · fait' : ''}
        </em>
        <strong>{l.first_name}</strong>
        <span>{[l.service, l.vehicle].filter(Boolean).join(' · ')}</span>
        {large && (l.address || l.city) && <span>{[l.address, l.city].filter(Boolean).join(', ')}</span>}
        {l.quoted_price ? <span>{euros(l.quoted_price)}</span> : null}
        {rain && rain.prob >= 40 && <span className={v2.rainChip}>🌧️ pluie {rain.prob} %</span>}
        {l.track_stage === 'en_route' && <span className={v2.liveChip}>En route</span>}
        {l.track_stage === 'sur_place' && <span className={v2.liveChip}>Sur place</span>}
      </button>
      <div className={styles.rdvActs}>
        {!done && isToday && onGo && l.track_stage !== 'sur_place' && (
          <button type="button" className={styles.iconBtnSm2} onClick={() => onGo(l)} aria-label={l.track_stage === 'en_route' ? 'Je suis arrivé' : 'Je pars'} title={l.track_stage === 'en_route' ? 'Je suis arrivé' : 'Je pars'}>
            <Icon name="car" size={15} />
          </button>
        )}
        {onVisit && (
          <button type="button" className={styles.iconBtnSm2} onClick={() => onVisit(l)} aria-label="Intervention : checklist, photos, état des lieux" title="Intervention">
            <Icon name="camera" size={15} />
          </button>
        )}
        {!done && l.status === 'reserve' && (
          <button type="button" className={styles.rdvDoneBtn} onClick={() => onComplete(l)} aria-label={`Prestation de ${l.first_name} terminée`}>
            <Icon name="check" size={15} /> {large ? 'Terminé' : ''}
          </button>
        )}
        {!done && (
          <button type="button" className={styles.iconBtnSm2} onClick={() => onMove(l)} aria-label="Décaler le RDV" title="Décaler">
            <Icon name="clock" size={15} />
          </button>
        )}
        <a className={styles.iconBtnSm2} href={telHref(l)} aria-label={`Appeler ${l.first_name}`}>
          <Icon name="phone" size={15} />
        </a>
        <a
          className={styles.iconBtnSm2}
          href={whatsappHref(l, tpl.text)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={isPast ? 'Demande d’avis sur WhatsApp' : 'Rappel de la veille sur WhatsApp'}
          onClick={() => logActivity(l.id, 'whatsapp', `WhatsApp « ${tpl.label} »`)}
        >
          <Icon name="whatsapp" size={15} />
        </a>
        {maps && (
          <a className={styles.iconBtnSm2} href={maps} target="_blank" rel="noopener noreferrer" aria-label="Itinéraire">
            <Icon name="map" size={15} />
          </a>
        )}
        {large && (
          <a className={styles.iconBtnSm2} href={gcalHref(l)} target="_blank" rel="noopener noreferrer" aria-label="Ajouter à Google Agenda">
            <Icon name="calendar" size={15} />
          </a>
        )}
      </div>
    </div>
  )
}

// Planning : vue jour (par heure) ou semaine, ajout sur un créneau, terminer, décaler.
export default function Planning({ leads, onOpen, logActivity, onAdd, onComplete, onMove, onGo, onVisit, fc, settings, saveCoords }) {
  const [mode, setMode] = useState(() => {
    try {
      return localStorage.getItem('lcc-planning') || 'jour'
    } catch {
      return 'jour'
    }
  })
  const [weekStart, setWeekStart] = useState(() => startOfWeek())
  const [day, setDay] = useState(() => startOfDay())
  const today = startOfDay()

  function switchMode(m) {
    setMode(m)
    try {
      localStorage.setItem('lcc-planning', m)
    } catch {}
  }

  const booked = useMemo(
    () =>
      leads
        .filter((l) => l.appointment_at && l.status !== 'perdu')
        .sort((a, b) => (a.appointment_at > b.appointment_at ? 1 : -1)),
    [leads]
  )
  const cardProps = { onOpen, logActivity, onComplete, onMove, onGo, onVisit, fc }

  const followups = leads
    .filter((l) => l.next_followup_at && !['perdu', 'avis_recu'].includes(l.status))
    .sort((a, b) => (a.next_followup_at > b.next_followup_at ? 1 : -1))
  const toPlace = leads.filter((l) => l.status === 'reserve' && !l.appointment_at)

  // ----- Vue jour -----
  const dayItems = booked.filter((l) => sameDay(l.appointment_at, day))
  const dayValue = dayItems.reduce((s, l) => s + Number(l.quoted_price || 0), 0)
  const dayMinutes = dayItems.reduce((s, l) => s + durationH(l) * 60, 0)
  const free = freeStarts(leads, day, 60).filter((d) => d.getMinutes() === 0)
  const hours = Array.from({ length: WORK_END - WORK_START }, (_, i) => WORK_START + i)

  // ----- Vue semaine -----
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const weekEnd = addDays(weekStart, 7)
  const inWeek = booked.filter((l) => new Date(l.appointment_at) >= weekStart && new Date(l.appointment_at) < weekEnd)
  const weekValue = inWeek.reduce((s, l) => s + Number(l.quoted_price || 0), 0)
  const freeDays = days.filter((d) => d >= today && d.getDay() !== 0 && !inWeek.some((l) => sameDay(l.appointment_at, d)))
  const weekLabel = `${weekStart.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} – ${addDays(weekStart, 6).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}`

  return (
    <div className={styles.stack}>
      <div className={styles.toolbar}>
        <div className={styles.segment} role="group" aria-label="Affichage">
          <button type="button" className={mode === 'jour' ? styles.segOn : ''} onClick={() => switchMode('jour')}>
            Jour
          </button>
          <button type="button" className={mode === 'semaine' ? styles.segOn : ''} onClick={() => switchMode('semaine')}>
            Semaine
          </button>
          <button type="button" className={mode === 'tournee' ? styles.segOn : ''} onClick={() => switchMode('tournee')}>
            Tournée
          </button>
        </div>
        <div className={styles.segment} role="group" aria-label="Navigation">
          <button
            type="button"
            onClick={() => (mode !== 'semaine' ? setDay(addDays(day, -1)) : setWeekStart(addDays(weekStart, -7)))}
            aria-label={mode !== 'semaine' ? 'Jour précédent' : 'Semaine précédente'}
          >
            <Icon name="left" size={16} />
          </button>
          <button type="button" onClick={() => (mode !== 'semaine' ? setDay(startOfDay()) : setWeekStart(startOfWeek()))}>
            {mode !== 'semaine' ? (sameDay(day, today) ? "Aujourd'hui" : formatDayLabel(day).replace(/^./, (c) => c.toUpperCase())) : 'Cette semaine'}
          </button>
          <button
            type="button"
            onClick={() => (mode !== 'semaine' ? setDay(addDays(day, 1)) : setWeekStart(addDays(weekStart, 7)))}
            aria-label={mode !== 'semaine' ? 'Jour suivant' : 'Semaine suivante'}
          >
            <Icon name="right" size={16} />
          </button>
        </div>
      </div>

      {mode === 'tournee' ? (
        <Tournee leads={leads} day={day} fc={fc} settings={settings} onOpen={onOpen} onGo={onGo} onVisit={onVisit} onComplete={onComplete} saveCoords={saveCoords} />
      ) : mode === 'jour' ? (
        <section className={styles.block}>
          <header className={styles.blockHead}>
            <h2>{formatDayLabel(day).replace(/^./, (c) => c.toUpperCase())}</h2>
            <span className={styles.weekMeta}>
              {dayItems.length} RDV
              {dayMinutes ? ` · ${formatDuration(Math.round(dayMinutes))} de travail` : ''}
              {dayValue ? ` · ${euros(dayValue)}` : ''}
            </span>
          </header>
          <div className={styles.dayList}>
            {hours.map((h) => {
              const slotStart = new Date(day)
              slotStart.setHours(h, 0, 0, 0)
              const items = dayItems.filter((l) => new Date(l.appointment_at).getHours() === h)
              const covered = dayItems.some((l) => {
                const s = new Date(l.appointment_at).getTime()
                return s < slotStart.getTime() && s + durationH(l) * 3600000 > slotStart.getTime()
              })
              const isFree = free.some((d) => d.getHours() === h)
              return (
                <div key={h} className={`${styles.hourRow} ${covered && !items.length ? styles.hourCovered : ''}`}>
                  <span className={styles.hourLabel}>{h}h</span>
                  <div className={styles.hourBody}>
                    {items.map((l) => (
                      <RdvCard key={l.id} l={l} {...cardProps} large />
                    ))}
                    {!items.length && !covered && isFree && (
                      <button type="button" className={styles.hourAdd} onClick={() => onAdd(day, hhmm(slotStart))}>
                        <Icon name="plus" size={15} /> Libre — ajouter un RDV à {h}h
                      </button>
                    )}
                    {!items.length && covered && <span className={styles.hourBusy}>en intervention</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      ) : (
        <>
          <p className={styles.weekMeta}>
            <strong className={styles.weekLabel}>{weekLabel}</strong> · {inWeek.length} RDV{weekValue ? ` · ${euros(weekValue)} prévus` : ''}
            {freeDays.length ? ` · ${freeDays.length} jour${freeDays.length > 1 ? 's' : ''} libre${freeDays.length > 1 ? 's' : ''}` : ''}
          </p>
          <div className={styles.week}>
            {days.map((d, i) => {
              const items = inWeek.filter((l) => sameDay(l.appointment_at, d))
              const isToday = sameDay(d, today)
              return (
                <section key={d.toISOString()} className={`${styles.weekDay} ${isToday ? styles.weekToday : ''} ${d < today ? styles.weekPast : ''}`}>
                  <h3>
                    <button
                      type="button"
                      className={styles.weekDayBtn}
                      onClick={() => {
                        setDay(d)
                        switchMode('jour')
                      }}
                    >
                      {DAY_NAMES[i]} <span>{d.getDate()}</span>
                    </button>
                    {d >= today && (
                      <button type="button" className={styles.weekAdd} onClick={() => onAdd(d)} aria-label={`Ajouter un RDV le ${d.toLocaleDateString('fr-FR')}`}>
                        <Icon name="plus" size={15} />
                      </button>
                    )}
                  </h3>
                  {items.length === 0 ? (
                    <p className={styles.weekFree}>{d < today ? '—' : 'Libre'}</p>
                  ) : (
                    items.map((l) => <RdvCard key={l.id} l={l} {...cardProps} />)
                  )}
                </section>
              )
            })}
          </div>
        </>
      )}

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
                    <span className={`${styles.miniWhen} ${new Date(l.next_followup_at) < today ? styles.textDanger : ''}`}>{formatDayLabel(l.next_followup_at)}</span>
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
                  <button type="button" onClick={() => onAdd(null, null, l)}>
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
