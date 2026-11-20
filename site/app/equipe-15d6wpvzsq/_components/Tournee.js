'use client'

import { useEffect, useMemo, useState } from 'react'
import styles from '../admin.module.css'
import v2 from '../v2.module.css'
import { Icon } from './Icon'
import { sameDay, formatTime, durationH, euros, roadKm, driveMinutes, routeHref, wazeHref, isOutdoor, CLIENT_STATUSES, formatDuration, telHref } from '../_lib/crm'
import { ensureCoords, geocode, slotRain, dayWeather, weatherEmoji } from '../_lib/geo'

// Tournée du jour : ordre des clients, trajets estimés, itinéraire complet, km.
export default function Tournee({ leads, day, fc, settings, onOpen, onGo, onVisit, onComplete, saveCoords }) {
  const stops = useMemo(
    () => leads.filter((l) => l.appointment_at && l.status !== 'perdu' && sameDay(l.appointment_at, day)).sort((a, b) => (a.appointment_at > b.appointment_at ? 1 : -1)),
    [leads, day]
  )
  const [coords, setCoords] = useState(new Map())
  const [base, setBase] = useState(null)
  const baseAddress = settings?.business?.base_address || 'Angers'
  const ids = stops.map((s) => `${s.id}:${s.address}:${s.city}`).join('|')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const b = await geocode(baseAddress).catch(() => null)
      if (!cancelled) setBase(b)
      const c = await ensureCoords(stops, saveCoords)
      if (!cancelled) setCoords(c)
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids, baseAddress])

  const legs = []
  let prev = base
  for (const s of stops) {
    const c = coords.get(s.id)
    const km = prev && c ? roadKm(prev, c) : null
    legs.push({ stop: s, km, min: driveMinutes(km) })
    prev = c || prev
  }
  const back = prev && base && stops.length ? roadKm(prev, base) : null
  const totalKm = legs.reduce((t, l) => t + (l.km || 0), 0) + (back || 0)
  const work = stops.reduce((t, l) => t + durationH(l) * 60, 0)
  const value = stops.reduce((t, l) => t + Number(l.quoted_price || 0), 0)
  const remaining = stops.filter((s) => !CLIENT_STATUSES.includes(s.status) && s.track_stage !== 'termine')
  const route = routeHref(remaining)
  const w = dayWeather(fc, day)

  if (!stops.length) {
    return (
      <section className={styles.block}>
        <div className={styles.emptyState}>
          <Icon name="route" size={22} />
          <p>
            <strong>Aucun RDV ce jour-là.</strong> La tournée se construit toute seule à partir du planning.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className={styles.block}>
      <div className={v2.tourHead}>
        <div className={v2.tourStats}>
          <div>
            <strong>{stops.length}</strong>
            <span>client{stops.length > 1 ? 's' : ''}</span>
          </div>
          <div>
            <strong>{totalKm ? `${Math.round(totalKm)} km` : '—'}</strong>
            <span>aller-retour estimé</span>
          </div>
          <div>
            <strong>{formatDuration(Math.round(work))}</strong>
            <span>sur place</span>
          </div>
          <div>
            <strong>{euros(value)}</strong>
            <span>prévus</span>
          </div>
          {w && (
            <div>
              <strong>
                {weatherEmoji(w.code)} {w.tmax}°
              </strong>
              <span>pluie {w.prob ?? 0} %</span>
            </div>
          )}
        </div>
        {route && (
          <a className={`${styles.btnPrimary} ${v2.tourGo}`} href={route} target="_blank" rel="noopener noreferrer">
            <Icon name="route" size={18} /> Itinéraire complet ({remaining.length} arrêt{remaining.length > 1 ? 's' : ''})
          </a>
        )}
      </div>

      <ol className={v2.tour}>
        <li className={v2.tourBase}>
          <span className={v2.tourDot}>
            <Icon name="home" size={14} />
          </span>
          <div>
            <strong>Départ</strong>
            <span>{baseAddress}</span>
          </div>
        </li>
        {legs.map(({ stop: s, km, min }, i) => {
          const rain = isOutdoor(s.service) ? slotRain(fc, s.appointment_at, durationH(s) * 60) : null
          const done = CLIENT_STATUSES.includes(s.status) || s.track_stage === 'termine'
          const waze = wazeHref(s)
          return (
            <li key={s.id} className={done ? v2.tourDone : s.track_stage ? v2.tourLive : ''}>
              {km != null && (
                <p className={v2.tourLeg}>
                  <Icon name="car" size={14} /> {km} km · ~{min} min
                </p>
              )}
              <span className={v2.tourDot}>{done ? <Icon name="check" size={14} /> : i + 1}</span>
              <div className={v2.tourBody}>
                <button type="button" className={v2.tourMain} onClick={() => onOpen(s.id)}>
                  <em>
                    {formatTime(s.appointment_at)} · {formatDuration(Math.round(durationH(s) * 60))}
                    {s.track_stage === 'en_route' ? ' · en route' : s.track_stage === 'sur_place' ? ' · sur place' : ''}
                  </em>
                  <strong>{s.first_name}</strong>
                  <span>{[s.service, s.vehicle].filter(Boolean).join(' · ')}</span>
                  <span>{[s.address, s.city].filter(Boolean).join(', ') || 'Adresse à compléter'}</span>
                </button>
                {rain && rain.prob >= 40 && <p className={v2.rainWarn}>🌧️ Pluie {rain.prob} % pendant le créneau</p>}
                {!done && (
                  <div className={v2.tourActs}>
                    {s.track_stage !== 'sur_place' && (
                      <button type="button" className={styles.btnPrimary} onClick={() => onGo(s, min)}>
                        <Icon name="car" size={16} /> {s.track_stage === 'en_route' ? 'Arrivé' : 'Je pars'}
                      </button>
                    )}
                    <button type="button" className={styles.btnSecondary} onClick={() => onVisit(s)}>
                      <Icon name="camera" size={16} /> Intervention
                    </button>
                    {s.status === 'reserve' && new Date(s.appointment_at) <= new Date() && (
                      <button type="button" className={styles.btnSecondary} onClick={() => onComplete(s)}>
                        <Icon name="check" size={16} /> Terminé
                      </button>
                    )}
                    {waze && (
                      <a className={styles.iconBtnSm2} href={waze} target="_blank" rel="noopener noreferrer" aria-label="Ouvrir dans Waze">
                        <Icon name="map" size={15} />
                      </a>
                    )}
                    <a className={styles.iconBtnSm2} href={telHref(s)} aria-label={`Appeler ${s.first_name}`}>
                      <Icon name="phone" size={15} />
                    </a>
                  </div>
                )}
              </div>
            </li>
          )
        })}
        <li className={v2.tourBase}>
          {back != null && (
            <p className={v2.tourLeg}>
              <Icon name="car" size={14} /> {back} km · ~{driveMinutes(back)} min
            </p>
          )}
          <span className={v2.tourDot}>
            <Icon name="home" size={14} />
          </span>
          <div>
            <strong>Retour</strong>
            <span>{baseAddress}</span>
          </div>
        </li>
      </ol>
      <p className={styles.hint}>Distances estimées à partir des adresses (trajet routier approximatif). Réglez l&apos;adresse de départ et le temps de trajet entre deux clients dans Réglages.</p>
    </section>
  )
}
