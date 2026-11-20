'use client'

import { useEffect, useState } from 'react'
import styles from '../admin.module.css'
import v2 from '../v2.module.css'
import { Icon } from './Icon'
import {
  durationH,
  formatTime,
  formatDayLabel,
  sameDay,
  telHref,
  whatsappHref,
  smsHref,
  mapsHref,
  wazeHref,
  templates,
  onMyWayText,
  lateText,
  arrivedText,
  almostDoneText,
} from '../_lib/crm'

const ETA_CHOICES = [5, 10, 15, 20, 30, 45]
const LATE_CHOICES = [5, 10, 15, 30]

// Quelle intervention mettre en avant sur l'accueil ?
// 1. celle en cours (en route / sur place), 2. la prochaine du jour, 3. un avis à demander, 4. le prochain RDV.
export function pickMission(leads, now = new Date()) {
  const booked = leads.filter((l) => l.appointment_at && l.status !== 'perdu').sort((a, b) => (a.appointment_at > b.appointment_at ? 1 : -1))
  const todays = booked.filter((l) => sameDay(l.appointment_at, now))
  const live = todays.find((l) => l.status === 'reserve' && ['en_route', 'sur_place'].includes(l.track_stage))
  if (live) return { lead: live, mode: live.track_stage }
  const nextToday = todays.find((l) => l.status === 'reserve' && l.track_stage !== 'termine')
  if (nextToday) return { lead: nextToday, mode: 'avant' }
  const review = todays.filter((l) => l.status === 'fait' && !l.review_requested_at).pop()
  if (review) return { lead: review, mode: 'avis' }
  const next = booked.find((l) => l.status === 'reserve' && new Date(l.appointment_at) > now)
  if (next) return { lead: next, mode: 'plus_tard' }
  return null
}

// Petite horloge : la carte se met à jour toute seule (minutes restantes, retard…).
function useNow(ms = 30000) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), ms)
    return () => clearInterval(id)
  }, [ms])
  return now
}

// Carte « Intervention » : tout ce qu'il faut pour le client du moment, sans ouvrir sa fiche.
export default function Mission({ mission, onOpen, onStage, onComplete, onVisit, onReview, onAdd, logActivity }) {
  const now = useNow()
  const [channel, setChannel] = useState('whatsapp')

  if (!mission) {
    return (
      <div className={v2.ms}>
        <div className={v2.msHead}>
          <span className={v2.msKicker}>Intervention</span>
          <strong className={v2.msTitle}>Aucun rendez-vous prévu</strong>
        </div>
        <button type="button" className={styles.heroBtnLight} onClick={() => onAdd?.()}>
          <Icon name="plus" size={17} /> Ajouter un RDV
        </button>
      </div>
    )
  }

  const { lead, mode } = mission
  const addr = [lead.address, lead.city].filter(Boolean).join(', ')
  const waze = wazeHref(lead)
  const maps = mapsHref(lead)
  const send = (text) => (channel === 'sms' ? smsHref(lead, text) : whatsappHref(lead, text))
  const sendProps = (text) => (channel === 'sms' ? { href: smsHref(lead, text) } : { href: whatsappHref(lead, text), target: '_blank', rel: 'noopener noreferrer' })
  const log = (label) => logActivity?.(lead.id, channel === 'sms' ? 'sms' : 'whatsapp', label)
  const who = [lead.first_name, lead.vehicle].filter(Boolean).join(' · ')
  const start = new Date(lead.appointment_at)
  const eta = lead.eta_at ? new Date(lead.eta_at) : null
  const minsLeft = eta ? Math.round((eta - now) / 60000) : null

  const navRow = () => (
    <div className={v2.msNav}>
      {waze && (
        <a className={v2.msNavBtn} href={waze} target="_blank" rel="noopener noreferrer">
          <Icon name="route" size={18} /> Waze
        </a>
      )}
      {maps && (
        <a className={v2.msNavBtn} href={maps} target="_blank" rel="noopener noreferrer">
          <Icon name="map" size={18} /> Maps
        </a>
      )}
      {(
        <a className={v2.msNavBtn} href={telHref(lead)} onClick={() => logActivity?.(lead.id, 'appel', 'Appel lancé depuis l’accueil')}>
          <Icon name="phone" size={18} /> Appeler
        </a>
      )}
      <button type="button" className={v2.msNavBtn} onClick={() => onOpen(lead.id)}>
        <Icon name="users" size={18} /> Fiche
      </button>
    </div>
  )

  const channelSwitch = () => (
    <div className={v2.msSwitch} role="group" aria-label="Envoyer par">
      {[
        ['whatsapp', 'WhatsApp'],
        ['sms', 'SMS'],
      ].map(([id, label]) => (
        <button type="button" key={id} className={channel === id ? v2.msSwitchOn : ''} onClick={() => setChannel(id)} aria-pressed={channel === id}>
          {label}
        </button>
      ))}
    </div>
  )

  // ---- Avant le départ ----
  if (mode === 'avant') {
    const late = start < now
    return (
      <div className={v2.ms}>
        <button type="button" className={v2.msHead} onClick={() => onOpen(lead.id)}>
          <span className={v2.msKicker}>
            Prochaine intervention · {formatTime(lead.appointment_at)}
            {late ? ' · en retard' : ''}
          </span>
          <strong className={v2.msTitle}>{who}</strong>
          <em className={v2.msSub}>{[lead.service, addr || 'adresse à compléter'].filter(Boolean).join(' · ')}</em>
        </button>

        <div className={v2.msBlock}>
          <div className={v2.msLabelRow}>
            <span className={v2.msLabel}>Prévenir le client : j&apos;arrive dans…</span>
            {channelSwitch()}
          </div>
          <div className={v2.msEta}>
            {ETA_CHOICES.map((m) => {
              const etaIso = new Date(now.getTime() + m * 60000).toISOString()
              return (
                <a
                  key={m}
                  className={v2.msEtaBtn}
                  {...sendProps(onMyWayText(lead, etaIso))}
                  onClick={() => {
                    // L'heure est recalculée au toucher (la carte peut être restée ouverte).
                    const at = new Date(Date.now() + m * 60000).toISOString()
                    onStage(lead, 'en_route', at)
                    log(`En route, arrivée annoncée dans ${m} min`)
                  }}
                >
                  <strong>{m}</strong>
                  <span>min</span>
                </a>
              )
            })}
          </div>
          <p className={v2.msHint}>Un seul toucher : le message part avec l&apos;heure d&apos;arrivée et sa page de suivi passe en « En route ».</p>
        </div>
        {navRow()}
      </div>
    )
  }

  // ---- En route ----
  if (mode === 'en_route') {
    return (
      <div className={v2.ms}>
        <button type="button" className={v2.msHead} onClick={() => onOpen(lead.id)}>
          <span className={`${v2.msKicker} ${v2.msLive}`}>
            <i aria-hidden="true" /> En route
          </span>
          <strong className={v2.msTitle}>
            {eta ? (minsLeft > 0 ? `Arrivée dans ${minsLeft} min` : minsLeft === 0 ? 'Arrivée maintenant' : `${-minsLeft} min de retard`) : 'En route'}
          </strong>
          <em className={v2.msSub}>
            {who}
            {eta ? ` · annoncé à ${formatTime(lead.eta_at)}` : ''}
            {addr ? ` · ${addr}` : ''}
          </em>
        </button>

        {navRow()}

        <button
          type="button"
          className={`${styles.heroBtnLight} ${v2.msMain}`}
          onClick={() => onStage(lead, 'sur_place', new Date(Date.now() + durationH(lead) * 3600000).toISOString())}
        >
          <Icon name="check" size={18} /> Je suis arrivé
        </button>

        <div className={v2.msBlock}>
          <div className={v2.msLabelRow}>
            <span className={v2.msLabel}>Un retard ? Prévenir : j&apos;arrive dans…</span>
            {channelSwitch()}
          </div>
          <div className={v2.msEta}>
            {LATE_CHOICES.map((m) => {
              const etaIso = new Date(now.getTime() + m * 60000).toISOString()
              return (
                <a
                  key={m}
                  className={v2.msEtaBtn}
                  {...sendProps(lateText(lead, etaIso))}
                  onClick={() => {
                    onStage(lead, 'en_route', new Date(Date.now() + m * 60000).toISOString())
                    log(`Retard annoncé, arrivée dans ${m} min`)
                  }}
                >
                  <strong>{m}</strong>
                  <span>min</span>
                </a>
              )
            })}
          </div>
          <a className={v2.msTextLink} {...sendProps(arrivedText(lead))} onClick={() => log('« Je suis devant chez vous » envoyé')}>
            <Icon name={channel === 'sms' ? 'sms' : 'whatsapp'} size={15} /> « Je suis devant chez vous »
          </a>
        </div>
      </div>
    )
  }

  // ---- Sur place : nettoyage en cours ----
  if (mode === 'sur_place') {
    const end = eta || new Date(start.getTime() + durationH(lead) * 3600000)
    const total = durationH(lead) * 3600000
    const pct = Math.min(100, Math.max(3, Math.round((1 - (end - now) / total) * 100)))
    return (
      <div className={v2.ms}>
        <button type="button" className={v2.msHead} onClick={() => onOpen(lead.id)}>
          <span className={`${v2.msKicker} ${v2.msLive}`}>
            <i aria-hidden="true" /> Nettoyage en cours
          </span>
          <strong className={v2.msTitle}>{who}</strong>
          <em className={v2.msSub}>Fin prévue vers {formatTime(end.toISOString())}</em>
        </button>
        <div className={v2.msProgress} aria-label={`${pct} %`}>
          <i style={{ width: `${pct}%` }} />
        </div>
        <div className={v2.msTwo}>
          {onVisit && (
            <button type="button" className={styles.heroBtn} onClick={() => onVisit(lead)}>
              <Icon name="camera" size={17} /> Photos &amp; checklist
            </button>
          )}
          <button type="button" className={styles.heroBtnLight} onClick={() => onComplete(lead)}>
            <Icon name="check" size={17} /> Terminé
          </button>
        </div>
        <div className={v2.msInline}>
          <a className={v2.msTextLink} {...sendProps(almostDoneText(lead, end.toISOString()))} onClick={() => log('« Bientôt terminé » envoyé')}>
            <Icon name={channel === 'sms' ? 'sms' : 'whatsapp'} size={15} /> « J&apos;ai bientôt fini »
          </a>
          <a className={v2.msTextLink} href={telHref(lead)}>
            <Icon name="phone" size={15} /> Appeler
          </a>
        </div>
      </div>
    )
  }

  // ---- Terminé aujourd'hui : avis à demander ----
  if (mode === 'avis') {
    return (
      <div className={v2.ms}>
        <button type="button" className={v2.msHead} onClick={() => onOpen(lead.id)}>
          <span className={v2.msKicker}>Terminé ✓</span>
          <strong className={v2.msTitle}>{who}</strong>
          <em className={v2.msSub}>Demandez l&apos;avis tant que la voiture brille</em>
        </button>
        <button type="button" className={`${styles.heroBtnLight} ${v2.msMain}`} onClick={() => onReview?.(lead)}>
          <Icon name="star" size={18} /> Demander l&apos;avis avec la photo
        </button>
      </div>
    )
  }

  // ---- Prochain RDV (un autre jour) ----
  const tomorrow = sameDay(lead.appointment_at, new Date(now.getTime() + 86400000))
  const tpl = templates(lead).find((t) => t.id === (tomorrow ? 'veille' : 'confirmation'))
  return (
    <div className={v2.ms}>
      <button type="button" className={v2.msHead} onClick={() => onOpen(lead.id)}>
        <span className={v2.msKicker}>Prochain rendez-vous</span>
        <strong className={v2.msTitle}>
          {lead.first_name}, {formatDayLabel(lead.appointment_at).toLowerCase()} à {formatTime(lead.appointment_at)}
        </strong>
        <em className={v2.msSub}>{[lead.service, addr].filter(Boolean).join(' · ')}</em>
      </button>
      <div className={v2.msTwo}>
        <a className={styles.heroBtnLight} href={send(tpl.text)} {...(channel === 'sms' ? {} : { target: '_blank', rel: 'noopener noreferrer' })} onClick={() => log(`« ${tpl.label} » envoyé`)}>
          <Icon name="whatsapp" size={17} /> {tpl.label}
        </a>
        <a className={styles.heroBtn} href={telHref(lead)}>
          <Icon name="phone" size={17} /> Appeler
        </a>
      </div>
    </div>
  )
}
