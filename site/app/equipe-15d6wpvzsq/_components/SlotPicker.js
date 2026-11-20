'use client'

import styles from '../admin.module.css'
import { addDays, startOfDay, sameDay, atTime, hhmm, conflicts, formatDuration, toDateInput } from '../_lib/crm'

const TIMES = ['08:00', '09:00', '10:00', '11:00', '13:30', '14:00', '15:00', '16:00', '17:00']
const DURATIONS = [60, 90, 120, 150, 180, 240, 300, 480]

// Choix du jour, de l'heure et de la durée en quelques touches.
// value = { day: Date, time: 'HH:MM', minutes: number }
export default function SlotPicker({ leads, value, onChange, excludeId = null }) {
  const today = startOfDay()
  const days = Array.from({ length: 8 }, (_, i) => addDays(today, i))
  const { day, time, minutes } = value
  const set = (patch) => onChange({ ...value, ...patch })

  const dayLabel = (d, i) =>
    i === 0 ? "Aujourd'hui" : i === 1 ? 'Demain' : d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }).replace('.', '')
  const busyCount = (d) => leads.filter((l) => l.appointment_at && l.status !== 'perdu' && l.id !== excludeId && sameDay(l.appointment_at, d)).length

  const start = day && time ? atTime(day, time) : null
  const clash = start ? conflicts(leads, start.toISOString(), minutes, excludeId) : []
  const timeBusy = (t) => day && conflicts(leads, atTime(day, t).toISOString(), minutes, excludeId).length > 0
  const timePast = (t) => day && atTime(day, t) < new Date()
  const customDay = day && !days.some((d) => sameDay(d, day))

  return (
    <div className={styles.slot}>
      <div className={styles.slotLabel}>Jour</div>
      <div className={styles.chips}>
        {days.map((d, i) => {
          const n = busyCount(d)
          return (
            <button type="button" key={d.toISOString()} className={`${styles.chip} ${day && sameDay(day, d) ? styles.chipOn : ''}`} onClick={() => set({ day: d })}>
              {dayLabel(d, i)}
              {n > 0 && <span className={styles.slotDot}>{n}</span>}
            </button>
          )
        })}
        <label className={`${styles.chip} ${customDay ? styles.chipOn : ''} ${styles.slotDate}`}>
          {customDay ? day.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : 'Autre date'}
          <input
            type="date"
            value={day ? toDateInput(day.toISOString()) : ''}
            onChange={(e) => e.target.value && set({ day: new Date(`${e.target.value}T00:00:00`) })}
            aria-label="Choisir une autre date"
          />
        </label>
      </div>

      <div className={styles.slotLabel}>Heure</div>
      <div className={styles.slotTimes}>
        {TIMES.map((t) => {
          const busy = timeBusy(t)
          const past = timePast(t)
          return (
            <button
              type="button"
              key={t}
              className={`${styles.slotTime} ${time === t ? styles.slotTimeOn : ''} ${busy ? styles.slotBusy : ''}`}
              disabled={past}
              onClick={() => set({ time: t })}
              title={busy ? 'Déjà un RDV sur ce créneau' : undefined}
            >
              {t.replace(':00', 'h').replace(':', 'h')}
            </button>
          )
        })}
        <input type="time" step="900" className={styles.slotTimeInput} value={time || ''} onChange={(e) => set({ time: e.target.value })} aria-label="Heure précise" />
      </div>

      <div className={styles.slotLabel}>Durée sur place</div>
      <div className={styles.chips}>
        {DURATIONS.map((m) => (
          <button type="button" key={m} className={`${styles.chip} ${minutes === m ? styles.chipOn : ''}`} onClick={() => set({ minutes: m })}>
            {m === 480 ? 'Journée' : formatDuration(m)}
          </button>
        ))}
      </div>

      {start && (
        <p className={clash.length ? styles.slotWarn : styles.slotOk}>
          {clash.length
            ? `Attention : chevauche le RDV de ${clash.map((c) => `${c.first_name} (${hhmm(c.appointment_at).replace(':', 'h')})`).join(', ')}`
            : `${start.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} de ${hhmm(start).replace(':', 'h')} à ${hhmm(new Date(start.getTime() + minutes * 60000)).replace(':', 'h')} : créneau libre`}
        </p>
      )}
    </div>
  )
}
