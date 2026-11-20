'use client'

import { useMemo, useState } from 'react'
import styles from '../admin.module.css'
import { Icon } from './Icon'
import SlotPicker from './SlotPicker'
import {
  CATALOG,
  QUICK_SIZES,
  EXPENSE_CATEGORIES,
  priceFor,
  defaultMinutes,
  atTime,
  startOfDay,
  addDays,
  formatPhone,
  searchLeads,
  templates,
  whatsappHref,
  smsHref,
  gcalHref,
  toDateInput,
  euros,
} from '../_lib/crm'

const MODES = [
  { id: 'rdv', label: 'RDV', icon: 'calendar' },
  { id: 'tache', label: 'Tâche', icon: 'check' },
  { id: 'depense', label: 'Dépense', icon: 'euro' },
  { id: 'prospect', label: 'Prospect', icon: 'users' },
]

// Le bouton « + » : un RDV, une tâche ou une dépense en quelques secondes.
export default function QuickAdd({ leads, initial = {}, onClose, onCreateRdv, onAddTask, onAddExpense, onNewProspect, onOpenLead }) {
  const [mode, setMode] = useState(initial.mode || 'rdv')

  function pick(m) {
    if (m === 'prospect') {
      onNewProspect()
      return
    }
    setMode(m)
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Ajouter">
      <button type="button" className={styles.backdrop} onClick={onClose} aria-label="Fermer" />
      <div className={`${styles.sheet} ${styles.sheetSmall} ${styles.sheetWide}`}>
        <header className={styles.sheetHead}>
          <div className={styles.segment} role="tablist" aria-label="Que voulez-vous ajouter ?">
            {MODES.map((m) => (
              <button type="button" role="tab" aria-selected={mode === m.id} key={m.id} className={mode === m.id ? styles.segOn : ''} onClick={() => pick(m.id)}>
                <Icon name={m.icon} size={15} /> {m.label}
              </button>
            ))}
          </div>
          <button type="button" className={styles.iconBtn} onClick={onClose} aria-label="Fermer">
            <Icon name="close" />
          </button>
        </header>
        {mode === 'rdv' && <RdvForm leads={leads} initial={initial} onCreate={onCreateRdv} onClose={onClose} onOpenLead={onOpenLead} />}
        {mode === 'tache' && <TaskForm leads={leads} onAdd={onAddTask} onClose={onClose} />}
        {mode === 'depense' && <ExpenseForm onAdd={onAddExpense} onClose={onClose} />}
      </div>
    </div>
  )
}

function RdvForm({ leads, initial, onCreate, onClose, onOpenLead }) {
  const [q, setQ] = useState('')
  const [client, setClient] = useState(initial.lead || null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [service, setService] = useState(initial.lead?.service || '')
  const [size, setSize] = useState(initial.lead?.vehicle_size || '')
  const [price, setPrice] = useState(initial.lead?.quoted_price ?? '')
  const [priceTouched, setPriceTouched] = useState(Boolean(initial.lead?.quoted_price))
  const [vehicle, setVehicle] = useState(initial.lead?.vehicle || '')
  const [address, setAddress] = useState(initial.lead?.address || '')
  const [city, setCity] = useState(initial.lead?.city || '')
  const [notes, setNotes] = useState('')
  const [slot, setSlot] = useState({
    day: initial.day ? startOfDay(initial.day) : startOfDay(addDays(new Date(), 1)),
    time: initial.time || '',
    minutes: initial.lead?.duration_min || defaultMinutes(initial.lead?.service),
  })
  const [slotTouched, setSlotTouched] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [done, setDone] = useState(null)

  const matches = useMemo(() => (q.trim().length >= 2 ? searchLeads(leads, q).slice(0, 5) : []), [leads, q])

  function chooseClient(l) {
    setClient(l)
    setQ('')
    if (l.service && !service) setService(l.service)
    if (l.vehicle_size) setSize(l.vehicle_size)
    setVehicle(l.vehicle || '')
    setAddress(l.address || '')
    setCity(l.city || '')
  }

  function chooseService(s) {
    setService(s)
    if (!slotTouched) setSlot((v) => ({ ...v, minutes: defaultMinutes(s) }))
    if (!priceTouched) {
      const p = priceFor(s, size)
      setPrice(p ?? '')
    }
  }

  function chooseSize(s) {
    setSize(s)
    if (!priceTouched) {
      const p = priceFor(service, s)
      if (p) setPrice(p)
    }
  }

  async function submit(e) {
    e.preventDefault()
    setErr('')
    if (!client && (!name.trim() || phone.replace(/\D/g, '').length < 6)) return setErr('Indiquez le nom et le téléphone du client (ou choisissez un client existant).')
    if (!slot.time) return setErr("Choisissez l'heure du rendez-vous.")
    setBusy(true)
    const lead = await onCreate({
      lead: client,
      first_name: name.trim(),
      phone: phone.trim(),
      service: service.trim() || null,
      vehicle_size: size || null,
      quoted_price: price === '' ? null : Number(price),
      vehicle: vehicle.trim() || null,
      address: address.trim() || null,
      city: city.trim() || null,
      notes: notes.trim() || null,
      appointment_at: atTime(slot.day, slot.time).toISOString(),
      duration_min: slot.minutes,
    })
    setBusy(false)
    if (lead) setDone(lead)
  }

  if (done) {
    const tpl = templates(done).find((t) => t.id === 'confirmation')
    return (
      <section className={styles.sheetSection}>
        <div className={styles.doneBox}>
          <span className={styles.doneIcon}>
            <Icon name="check" size={26} />
          </span>
          <h3>RDV ajouté au planning</h3>
          <p>
            {done.first_name} · {new Date(done.appointment_at).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} à{' '}
            {new Date(done.appointment_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            {done.quoted_price ? ` · ${euros(done.quoted_price)}` : ''}
          </p>
        </div>
        <div className={styles.doneActions}>
          <a className={styles.actWa} href={whatsappHref(done, tpl.text)} target="_blank" rel="noopener noreferrer">
            <Icon name="whatsapp" size={18} /> Confirmer par WhatsApp
          </a>
          <a className={styles.btnSecondary} href={smsHref(done, tpl.text)}>
            <Icon name="sms" size={18} /> Par SMS
          </a>
          <a className={styles.btnSecondary} href={gcalHref(done)} target="_blank" rel="noopener noreferrer">
            <Icon name="calendar" size={18} /> Google Agenda
          </a>
        </div>
        <div className={styles.rowBtns}>
          <button type="button" className={styles.btnSecondary} onClick={() => onOpenLead(done.id)}>
            Ouvrir la fiche
          </button>
          <button type="button" className={styles.btnPrimary} onClick={onClose}>
            Terminé
          </button>
        </div>
      </section>
    )
  }

  return (
    <form onSubmit={submit}>
      <section className={styles.sheetSection}>
        <h3>Client</h3>
        {client ? (
          <div className={styles.pickedClient}>
            <span className={styles.avatar}>{(client.first_name || '?').slice(0, 1).toUpperCase()}</span>
            <div>
              <strong>{client.first_name}</strong>
              <span>{[formatPhone(client.phone), client.city].filter(Boolean).join(' · ')}</span>
            </div>
            <button type="button" className={styles.linkBtn} onClick={() => setClient(null)}>
              Changer
            </button>
          </div>
        ) : (
          <>
            <div className={styles.search}>
              <Icon name="search" size={17} />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Client existant : nom, téléphone, ville…" aria-label="Rechercher un client existant" />
            </div>
            {matches.length > 0 && (
              <ul className={styles.matchList}>
                {matches.map((l) => (
                  <li key={l.id}>
                    <button type="button" onClick={() => chooseClient(l)}>
                      <strong>{l.first_name}</strong>
                      <span>{[formatPhone(l.phone), l.vehicle, l.city].filter(Boolean).join(' · ')}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <p className={styles.hint}>Ou nouveau client :</p>
            <div className={styles.grid2}>
              <label className={styles.field}>
                Prénom / nom
                <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" />
              </label>
              <label className={styles.field}>
                Téléphone
                <input type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="off" />
              </label>
            </div>
          </>
        )}
      </section>

      <section className={styles.sheetSection}>
        <h3>Prestation</h3>
        <div className={styles.chipsWrap}>
          {CATALOG.map((c) => (
            <button type="button" key={c.label} className={`${styles.chip} ${service === c.label ? styles.chipOn : ''}`} onClick={() => chooseService(c.label)}>
              {c.short}
            </button>
          ))}
        </div>
        <div className={styles.chipsWrap}>
          {QUICK_SIZES.map((s) => (
            <button type="button" key={s.id} className={`${styles.chip} ${styles.chipSoft} ${size === s.id ? styles.chipOn : ''}`} onClick={() => chooseSize(s.id)}>
              {s.label}
            </button>
          ))}
        </div>
        <div className={styles.grid2}>
          <label className={styles.field}>
            Prix (€)
            <input
              type="number"
              min="0"
              step="1"
              inputMode="decimal"
              value={price}
              onChange={(e) => {
                setPrice(e.target.value)
                setPriceTouched(true)
              }}
              placeholder="Sur devis"
            />
          </label>
          <label className={styles.field}>
            Véhicule
            <input value={vehicle} onChange={(e) => setVehicle(e.target.value)} placeholder="Ex. Golf 7" />
          </label>
        </div>
      </section>

      <section className={styles.sheetSection}>
        <h3>Quand ?</h3>
        <SlotPicker
          leads={leads}
          value={slot}
          excludeId={client?.id}
          onChange={(v) => {
            if (v.minutes !== slot.minutes) setSlotTouched(true)
            setSlot(v)
          }}
        />
      </section>

      <section className={styles.sheetSection}>
        <h3>Où ?</h3>
        <div className={styles.grid2}>
          <label className={styles.field}>
            Adresse
            <input value={address} onChange={(e) => setAddress(e.target.value)} autoComplete="off" />
          </label>
          <label className={styles.field}>
            Ville
            <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Angers" />
          </label>
        </div>
        <label className={styles.field}>
          Notes
          <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Code portail, état du véhicule, prise électrique…" />
        </label>
      </section>

      <div className={styles.sheetFoot}>
        {err && <p className={styles.errText}>{err}</p>}
        <button type="submit" className={`${styles.btnPrimary} ${styles.btnBlock}`} disabled={busy}>
          {busy ? 'Ajout…' : 'Ajouter le RDV'}
        </button>
      </div>
    </form>
  )
}

function TaskForm({ leads, onAdd, onClose }) {
  const [title, setTitle] = useState('')
  const [due, setDue] = useState(toDateInput(new Date().toISOString()))
  const [busy, setBusy] = useState(false)
  const today = new Date()
  const dues = [
    { label: "Aujourd'hui", v: toDateInput(today.toISOString()) },
    { label: 'Demain', v: toDateInput(addDays(today, 1).toISOString()) },
    { label: 'Dans 1 semaine', v: toDateInput(addDays(today, 7).toISOString()) },
    { label: 'Sans date', v: '' },
  ]
  async function submit(e) {
    e.preventDefault()
    if (!title.trim()) return
    setBusy(true)
    const ok = await onAdd({ title: title.trim(), due_on: due || null })
    setBusy(false)
    if (ok) onClose()
  }
  return (
    <form onSubmit={submit}>
      <section className={styles.sheetSection}>
        <label className={styles.field}>
          À faire
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex. racheter du shampoing, rappeler BMW Angers…" autoFocus />
        </label>
        <div className={styles.chipsWrap}>
          {dues.map((d) => (
            <button type="button" key={d.label} className={`${styles.chip} ${due === d.v ? styles.chipOn : ''}`} onClick={() => setDue(d.v)}>
              {d.label}
            </button>
          ))}
          <input type="date" className={styles.chipDate} value={due} onChange={(e) => setDue(e.target.value)} aria-label="Date" />
        </div>
        <p className={styles.hint}>Elle apparaîtra sur l’accueil le jour J.</p>
      </section>
      <div className={styles.sheetFoot}>
        <button type="submit" className={`${styles.btnPrimary} ${styles.btnBlock}`} disabled={busy || !title.trim()}>
          {busy ? 'Ajout…' : 'Ajouter la tâche'}
        </button>
      </div>
    </form>
  )
}

function ExpenseForm({ onAdd, onClose }) {
  const [label, setLabel] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('produits')
  const [day, setDay] = useState(toDateInput(new Date().toISOString()))
  const [busy, setBusy] = useState(false)
  async function submit(e) {
    e.preventDefault()
    if (!amount) return
    setBusy(true)
    const cat = EXPENSE_CATEGORIES.find((c) => c.id === category)
    const ok = await onAdd({ label: label.trim() || cat.label, amount: Number(amount), category, spent_on: day })
    setBusy(false)
    if (ok) onClose()
  }
  return (
    <form onSubmit={submit}>
      <section className={styles.sheetSection}>
        <div className={styles.grid2}>
          <label className={styles.field}>
            Montant (€)
            <input type="number" min="0" step="0.01" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} required autoFocus />
          </label>
          <label className={styles.field}>
            Date
            <input type="date" value={day} onChange={(e) => setDay(e.target.value)} />
          </label>
        </div>
        <div className={styles.chipsWrap}>
          {EXPENSE_CATEGORIES.map((c) => (
            <button type="button" key={c.id} className={`${styles.chip} ${category === c.id ? styles.chipOn : ''}`} onClick={() => setCategory(c.id)}>
              {c.label}
            </button>
          ))}
        </div>
        <label className={styles.field}>
          Détail
          <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Ex. Koch Chemie Green Star 5 L" />
        </label>
      </section>
      <div className={styles.sheetFoot}>
        <button type="submit" className={`${styles.btnPrimary} ${styles.btnBlock}`} disabled={busy || !amount}>
          {busy ? 'Ajout…' : 'Ajouter la dépense'}
        </button>
      </div>
    </form>
  )
}
