'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import styles from './BookingWizard.module.css'
import { CATALOG, QUICK_SIZES, priceFor } from '@/lib/catalog'
import { fetchBusy, bookSlot, freeSlots, BOOKING_ERRORS, storedReferral, rememberReferral } from '@/lib/booking'
import { CONTACT } from '@/lib/constants'
import AddressAutocomplete from './AddressAutocomplete'

const GROUPS = [
  { label: 'Intérieur', test: (c) => /intérieur/i.test(c.label) },
  { label: 'Extérieur', test: (c) => /lavage|décontamination/i.test(c.label) },
  { label: 'Lustrage & finitions', test: (c) => /lustrage|correction|phares/i.test(c.label) },
  { label: 'Moto', test: (c) => /moto/i.test(c.label) },
]

const pad = (n) => String(n).padStart(2, '0')
const isoDay = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const hhmm = (d) => `${d.getHours()}h${d.getMinutes() ? pad(d.getMinutes()) : ''}`
const euros = (n) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)

function startOfDay(d = new Date()) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

export default function BookingWizard() {
  const router = useRouter()
  const params = useSearchParams()
  const items = useMemo(() => CATALOG.filter((c) => c.online), [])
  const initialService = items.find((c) => c.short.toLowerCase() === (params.get('prestation') || '').toLowerCase())?.label || ''

  const [service, setService] = useState(initialService)
  const [size, setSize] = useState(params.get('gabarit') || '')
  const [busy, setBusy] = useState(null)
  const [day, setDay] = useState(null)
  const [slot, setSlot] = useState(null)
  const [form, setForm] = useState(() => ({ name: '', phone: '', email: '', address: '', city: '', vehicle: '', notes: '', ref: (params.get('parrain') || storedReferral() || '').toUpperCase().slice(0, 12) }))
  const [state, setState] = useState('idle')
  const [error, setError] = useState('')

  useEffect(() => {
    const p = params.get('parrain')
    if (p) rememberReferral(p)
  }, [params])

  const loadBusy = () =>
    fetchBusy(isoDay(new Date()), 21)
      .then((rows) => setBusy(rows || []))
      .catch(() => setBusy([]))

  useEffect(() => {
    loadBusy()
  }, [])

  const item = items.find((c) => c.label === service)
  const needsSize = Boolean(item?.prices)
  const minutes = item?.minutes || 120
  const price = item ? priceFor(service, size) : null
  const sizes = QUICK_SIZES.filter((s) => (service === 'Nettoyage moto' ? s.id === 'moto' : s.id !== 'moto'))

  const days = useMemo(() => {
    const out = []
    for (let i = 0; out.length < 12 && i < 21; i++) {
      const d = new Date(startOfDay())
      d.setDate(d.getDate() + i)
      if (d.getDay() !== 0) out.push(d)
    }
    return out
  }, [])

  const slotsByDay = useMemo(() => {
    if (!busy) return null
    return new Map(days.map((d) => [isoDay(d), freeSlots(busy, d, minutes)]))
  }, [busy, days, minutes])

  const daySlots = day && slotsByDay ? slotsByDay.get(isoDay(day)) || [] : []
  const ready = service && (!needsSize || size)

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  async function submit(e) {
    e.preventDefault()
    setError('')
    if (!slot) return setError('Choisissez un créneau.')
    setState('sending')
    try {
      const token = await bookSlot({
        p_first_name: form.name.trim(),
        p_phone: form.phone.trim(),
        p_email: form.email.trim() || null,
        p_service: service,
        p_vehicle_size: size || null,
        p_vehicle: form.vehicle.trim() || null,
        p_address: form.address.trim(),
        p_city: form.city.trim() || null,
        p_start: slot.toISOString(),
        p_minutes: minutes,
        p_price: price,
        p_notes: form.notes.trim() || null,
        p_ref_code: form.ref.trim() || null,
      })
      if (typeof window !== 'undefined' && typeof window.gtag === 'function') window.gtag('event', 'generate_lead', { form_source: 'reservation-en-ligne' })
      setState('done')
      router.push(`/suivi/${token}?nouveau=1`)
    } catch (err) {
      setState('idle')
      const msg = BOOKING_ERRORS[err.code] || "La réservation n'a pas pu être enregistrée. Réessayez ou appelez-nous."
      setError(msg)
      if (err.code === 'pris') {
        setSlot(null)
        loadBusy()
      }
    }
  }

  return (
    <form className={styles.wrap} onSubmit={submit}>
      <ol className={styles.steps}>
        <li className={styles.step}>
          <h2>
            <span>1</span> Votre prestation
          </h2>
          {GROUPS.map((g) => {
            const list = items.filter(g.test)
            if (!list.length) return null
            return (
              <div key={g.label} className={styles.group}>
                <p className={styles.groupLabel}>{g.label}</p>
                <div className={styles.cards}>
                  {list.map((c) => {
                    const p = priceFor(c.label, size)
                    return (
                      <button
                        type="button"
                        key={c.label}
                        className={`${styles.card} ${service === c.label ? styles.on : ''}`}
                        onClick={() => {
                          setService(c.label)
                          setSlot(null)
                          if (c.label === 'Nettoyage moto') setSize('moto')
                          else if (size === 'moto') setSize('')
                        }}
                        aria-pressed={service === c.label}
                      >
                        <strong>{c.short}</strong>
                        <span>
                          {c.prices && size ? euros(p) : `dès ${euros(c.from || Math.min(...Object.values(c.prices || { a: 0 })))}`} ·{' '}
                          {c.minutes >= 60 ? `${Math.floor(c.minutes / 60)} h${c.minutes % 60 ? pad(c.minutes % 60) : ''}` : `${c.minutes} min`}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
          {needsSize && (
            <>
              <p className={styles.groupLabel}>Votre véhicule</p>
              <div className={styles.chips}>
                {sizes.map((s) => (
                  <button type="button" key={s.id} className={`${styles.chip} ${size === s.id ? styles.on : ''}`} onClick={() => setSize(s.id)} aria-pressed={size === s.id}>
                    {s.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </li>

        <li className={`${styles.step} ${!ready ? styles.locked : ''}`}>
          <h2>
            <span>2</span> Le jour et l&apos;heure
          </h2>
          {!ready ? (
            <p className={styles.muted}>Choisissez d&apos;abord la prestation{needsSize ? ' et le véhicule' : ''}.</p>
          ) : !slotsByDay ? (
            <p className={styles.muted}>Chargement des disponibilités…</p>
          ) : (
            <>
              <div className={styles.days}>
                {days.map((d) => {
                  const n = slotsByDay.get(isoDay(d))?.length || 0
                  const on = day && isoDay(day) === isoDay(d)
                  return (
                    <button
                      type="button"
                      key={isoDay(d)}
                      className={`${styles.day} ${on ? styles.on : ''}`}
                      disabled={!n}
                      onClick={() => {
                        setDay(d)
                        setSlot(null)
                      }}
                    >
                      <em>{d.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', '')}</em>
                      <strong>{d.getDate()}</strong>
                      <span>{n ? `${n} créneau${n > 1 ? 'x' : ''}` : 'complet'}</span>
                    </button>
                  )
                })}
              </div>
              {day && (
                <div className={styles.times}>
                  {daySlots.length === 0 ? (
                    <p className={styles.muted}>Plus de créneau ce jour-là.</p>
                  ) : (
                    daySlots.map((s) => (
                      <button type="button" key={s.toISOString()} className={`${styles.time} ${slot && slot.getTime() === s.getTime() ? styles.on : ''}`} onClick={() => setSlot(s)}>
                        {hhmm(s)}
                      </button>
                    ))
                  )}
                </div>
              )}
              <p className={styles.note}>Nous venons chez vous ou sur votre lieu de travail, dans un rayon de {CONTACT.radiusKm} km autour d&apos;{CONTACT.city}.</p>
            </>
          )}
        </li>

        <li className={`${styles.step} ${!slot ? styles.locked : ''}`}>
          <h2>
            <span>3</span> Vos coordonnées
          </h2>
          {!slot ? (
            <p className={styles.muted}>Choisissez un créneau pour continuer.</p>
          ) : (
            <>
              <div className={styles.grid}>
                <label>
                  Prénom et nom
                  <input required value={form.name} onChange={(e) => set('name', e.target.value)} autoComplete="name" maxLength={80} />
                </label>
                <label>
                  Téléphone
                  <input required type="tel" inputMode="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} autoComplete="tel" maxLength={20} />
                </label>
                <label className={styles.full}>
                  Adresse où se trouve le véhicule
                  <AddressAutocomplete
                    required
                    value={form.address}
                    onChange={(v) => set('address', v)}
                    onSelect={(it) => setForm((f) => ({ ...f, address: it.address || it.label, city: it.city || f.city }))}
                    autoComplete="street-address"
                    placeholder="Tapez votre adresse puis choisissez-la"
                  />
                </label>
                <label>
                  Ville
                  <input required value={form.city} onChange={(e) => set('city', e.target.value)} autoComplete="address-level2" placeholder="Angers" maxLength={120} />
                </label>
                <label>
                  Véhicule (modèle)
                  <input value={form.vehicle} onChange={(e) => set('vehicle', e.target.value)} placeholder="Ex. Peugeot 3008" maxLength={120} />
                </label>
                <label>
                  Email (facultatif)
                  <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} autoComplete="email" maxLength={254} />
                </label>
                <label>
                  Code parrain (facultatif)
                  <input value={form.ref} onChange={(e) => set('ref', e.target.value.toUpperCase())} maxLength={12} />
                </label>
                <label className={styles.full}>
                  Précisions (facultatif)
                  <textarea rows={3} value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Poils d'animaux, taches, code portail, prise électrique…" maxLength={1000} />
                </label>
              </div>
            </>
          )}
        </li>
      </ol>

      <aside className={styles.summary} aria-live="polite">
        <p className={styles.sumTitle}>Votre réservation</p>
        <dl>
          <div>
            <dt>Prestation</dt>
            <dd>{item ? item.short : '—'}</dd>
          </div>
          <div>
            <dt>Créneau</dt>
            <dd>{slot ? `${slot.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} à ${hhmm(slot)}` : '—'}</dd>
          </div>
          <div>
            <dt>Prix</dt>
            <dd>{price ? euros(price) : item ? (needsSize ? 'selon le véhicule' : 'sur place') : '—'}</dd>
          </div>
        </dl>
        <p className={styles.sumNote}>Déplacement compris · paiement après la prestation · annulation gratuite en nous prévenant.</p>
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="btn btn-cta btn-block" disabled={!slot || state !== 'idle'}>
          {state === 'sending' ? 'Réservation…' : state === 'done' ? 'Réservé !' : 'Confirmer la réservation'}
        </button>
        <p className={styles.sumNote}>
          Une question ? <a href={`tel:${CONTACT.phoneTel}`}>{CONTACT.phoneDisplay}</a>
        </p>
      </aside>
    </form>
  )
}
