'use client'

import { useRef, useState } from 'react'
import styles from '../admin.module.css'
import v2 from '../v2.module.css'
import { Icon } from './Icon'
import PlateScan, { PREPS, PREP_LABEL } from './PlateScan'
import { euros, euros2, formatDate, toDateInput, addDays } from '../_lib/crm'
import { photoUrl } from '../_lib/media'
import { typePlate, formatPlate } from '../_lib/plate'

export const DEFAULT_PARTNERS = ['BMW Angers', 'GR Motors']

export function partnerList(settings, leads = []) {
  const set = new Set([...(settings?.business?.partners || DEFAULT_PARTNERS), ...leads.map((l) => l.partner).filter(Boolean)])
  return [...set]
}

const ymd = (d) => toDateInput(d.toISOString())

// Périodes proposées : Enzo facture sur 1 mois ou 1 mois et demi.
function periodRange(kind, custom) {
  const now = new Date()
  if (kind === 'mois') return { from: ymd(new Date(now.getFullYear(), now.getMonth(), 1)), to: ymd(now), label: now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) }
  if (kind === 'precedent') {
    const a = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const b = new Date(now.getFullYear(), now.getMonth(), 0)
    return { from: ymd(a), to: ymd(b), label: a.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) }
  }
  if (kind === '45j') {
    const from = ymd(addDays(now, -44))
    return { from, to: ymd(now), label: `du ${formatDate(from, { day: 'numeric', month: 'short' })} au ${formatDate(ymd(now), { day: 'numeric', month: 'short' })}` }
  }
  return {
    from: custom.from,
    to: custom.to,
    label: `du ${formatDate(custom.from, { day: 'numeric', month: 'short' })} au ${formatDate(custom.to, { day: 'numeric', month: 'short', year: 'numeric' })}`,
  }
}

// Garages partenaires : chaque voiture scannée le jour même, vue jour par jour, devis/facture en un clic.
export default function Partners({ leads, docs, cars, settings, onSaveSettings, onAddCar, onUpdateCar, onDeleteCar, onMakeDoc, onOpenDoc, flash }) {
  const partners = partnerList(settings, leads)
  const [current, setCurrent] = useState(partners[0] || '')
  const [period, setPeriod] = useState('mois')
  const [custom, setCustom] = useState(() => ({ from: ymd(addDays(new Date(), -44)), to: ymd(new Date()) }))
  const [scan, setScan] = useState(null)
  const [editing, setEditing] = useState(null)
  const [newName, setNewName] = useState('')
  const [onlyTodo, setOnlyTodo] = useState(false)
  const scanInput = useRef(null)
  const biz = settings?.business || {}
  const rates = biz.partner_rates || {}
  const [rateForm, setRateForm] = useState(() => ({ ...(rates[current] || {}) }))

  const { from, to, label } = periodRange(period, custom)
  const docOf = (id) => docs.find((d) => d.id === id)
  const inPeriod = cars
    .filter((c) => c.partner === current && c.done_on >= from && c.done_on <= to)
    .sort((a, b) => (a.done_on === b.done_on ? (a.created_at < b.created_at ? 1 : -1) : a.done_on < b.done_on ? 1 : -1))
  const todo = inPeriod.filter((c) => !c.doc_id)
  const shown = onlyTodo ? todo : inPeriod
  const total = inPeriod.reduce((t, c) => t + Number(c.price || 0), 0)
  const todoTotal = todo.reduce((t, c) => t + Number(c.price || 0), 0)
  const nParc = inPeriod.filter((c) => c.prep === 'parc').length
  const nVendue = inPeriod.filter((c) => c.prep === 'vendue').length
  const today = ymd(new Date())
  const todayCount = cars.filter((c) => c.partner === current && c.done_on === today).length

  const days = [...shown.reduce((m, c) => m.set(c.done_on, [...(m.get(c.done_on) || []), c]), new Map())]

  function pick(p) {
    setCurrent(p)
    setRateForm({ ...(rates[p] || {}) })
  }

  async function addPartner(e) {
    e.preventDefault()
    const n = newName.trim()
    if (!n || partners.includes(n)) return
    await onSaveSettings({ business: { ...biz, partners: [...partners, n] } })
    pick(n)
    setNewName('')
  }

  async function saveRates(e) {
    e.preventDefault()
    const clean = Object.fromEntries(Object.entries(rateForm).filter(([, v]) => v !== '' && v !== null && v !== undefined).map(([k, v]) => [k, Number(v)]))
    await onSaveSettings({ business: { ...biz, partner_rates: { ...rates, [current]: clean } } })
  }

  function makeDoc(kind) {
    const list = [...todo].sort((a, b) => (a.done_on === b.done_on ? (a.created_at > b.created_at ? 1 : -1) : a.done_on > b.done_on ? 1 : -1))
    if (!list.length) return
    const lines = list.map((c) => ({
      label: [PREP_LABEL[c.prep] || c.prep || 'Préparation', c.model].filter(Boolean).join(' '),
      details: [c.plate && `Immatriculation ${c.plate}`, formatDate(c.done_on, { day: '2-digit', month: '2-digit', year: 'numeric' })].filter(Boolean).join(' · '),
      qty: 1,
      unit_price: Number(c.price) || 0,
    }))
    const notes = `${list.length} véhicule${list.length > 1 ? 's' : ''} préparé${list.length > 1 ? 's' : ''} ${label} (${list.filter((c) => c.prep === 'parc').length} préparation parc, ${list.filter((c) => c.prep === 'vendue').length} préparation vendue)`
    onMakeDoc(kind, current, list, lines, notes)
  }

  async function copyList() {
    const txt = [...inPeriod]
      .reverse()
      .map((c) => [formatDate(c.done_on, { day: '2-digit', month: '2-digit', year: 'numeric' }), c.plate, c.model || '', PREP_LABEL[c.prep] || c.prep, String(Number(c.price || 0)).replace('.', ',')].join('\t'))
      .join('\n')
    try {
      await navigator.clipboard.writeText(`Date\tPlaque\tModèle\tPréparation\tTarif\n${txt}`)
      flash?.('Liste copiée : collez-la dans un tableur ou un mail')
    } catch {
      flash?.("Copie impossible sur cet appareil")
    }
  }

  return (
    <div className={styles.stack}>
      <div className={styles.toolbar}>
        <div className={`${styles.segment} ${v2.scrollSeg}`} role="tablist" aria-label="Garage">
          {partners.map((p) => (
            <button type="button" key={p} role="tab" aria-selected={current === p} className={current === p ? styles.segOn : ''} onClick={() => pick(p)}>
              {p}
            </button>
          ))}
        </div>
      </div>

      <section className={v2.scanHero}>
        <button type="button" className={v2.scanHeroBtn} onClick={() => scanInput.current?.click()}>
          <Icon name="camera" size={26} />
          <span>
            <strong>Scanner une plaque</strong>
            <em>
              {current} · {todayCount ? `${todayCount} voiture${todayCount > 1 ? 's' : ''} aujourd'hui` : "aucune voiture aujourd'hui"}
            </em>
          </span>
        </button>
        <input
          ref={scanInput}
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0]
            e.target.value = ''
            if (f) setScan({ file: f })
          }}
        />
        <button type="button" className={v2.scanHeroLink} onClick={() => setScan({ manual: true })}>
          Saisir sans photo
        </button>
      </section>

      <div className={styles.toolbar}>
        <div className={`${styles.segment} ${v2.scrollSeg}`} role="group" aria-label="Période">
          {[
            ['mois', 'Ce mois'],
            ['precedent', 'Mois dernier'],
            ['45j', '1 mois ½'],
            ['perso', 'Dates'],
          ].map(([id, l]) => (
            <button type="button" key={id} className={period === id ? styles.segOn : ''} onClick={() => setPeriod(id)}>
              {l}
            </button>
          ))}
        </div>
      </div>
      {period === 'perso' && (
        <div className={styles.grid2}>
          <label className={styles.field}>
            Du
            <input type="date" value={custom.from} max={custom.to} onChange={(e) => setCustom({ ...custom, from: e.target.value })} />
          </label>
          <label className={styles.field}>
            Au
            <input type="date" value={custom.to} min={custom.from} onChange={(e) => setCustom({ ...custom, to: e.target.value })} />
          </label>
        </div>
      )}

      <div className={styles.cashKpis}>
        <div className={`${styles.cashKpi} ${styles.cashKpiMain}`}>
          <span>{label.replace(/^./, (c) => c.toUpperCase())}</span>
          <strong>{euros(total)}</strong>
          <em>
            {inPeriod.length} voiture{inPeriod.length > 1 ? 's' : ''} · {nParc} parc · {nVendue} vendue{nVendue > 1 ? 's' : ''}
          </em>
        </div>
        <div className={`${styles.cashKpi} ${todo.length ? styles.cashKpiWarn : ''}`}>
          <span>Pas encore facturé</span>
          <strong>{euros(todoTotal)}</strong>
          <em>
            {todo.length} voiture{todo.length > 1 ? 's' : ''}
          </em>
        </div>
      </div>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <h2>Jour par jour</h2>
          <div className={styles.rowBtns}>
            {inPeriod.length > 0 && (
              <button type="button" className={styles.linkBtn} onClick={copyList}>
                <Icon name="copy" size={15} /> Copier
              </button>
            )}
            {inPeriod.length > todo.length && todo.length > 0 && (
              <button type="button" className={styles.linkBtn} onClick={() => setOnlyTodo(!onlyTodo)}>
                {onlyTodo ? 'Tout voir' : 'Non facturées'}
              </button>
            )}
          </div>
        </div>
        {todo.length > 0 && (
          <div className={v2.garageDocs}>
            <button type="button" className={styles.btnPrimary} onClick={() => makeDoc('facture')}>
              <Icon name="file" size={16} /> Facture · {todo.length} voiture{todo.length > 1 ? 's' : ''} · {euros(todoTotal)}
            </button>
            <button type="button" className={styles.btnSecondary} onClick={() => makeDoc('devis')}>
              Devis
            </button>
          </div>
        )}
        {days.length === 0 ? (
          <p className={styles.empty}>Aucune voiture {current} sur cette période. Scannez la plaque juste après chaque voiture : tout s&apos;additionne ici, prêt pour la facture.</p>
        ) : (
          days.map(([day, list]) => (
            <div key={day} className={v2.garageDay}>
              <div className={v2.garageDayHead}>
                <strong>{formatDate(day, { weekday: 'long', day: 'numeric', month: 'long' }).replace(/^./, (c) => c.toUpperCase())}</strong>
                <span>
                  {list.length} voiture{list.length > 1 ? 's' : ''} · {euros(list.reduce((t, c) => t + Number(c.price || 0), 0))}
                </span>
              </div>
              <ul className={v2.rowsList}>
                {list.map((c) => {
                  const d = c.doc_id ? docOf(c.doc_id) : null
                  return (
                    <li key={c.id}>
                      {c.photo_path ? (
                        <a className={v2.plateThumb} href={photoUrl(c.photo_path)} target="_blank" rel="noopener noreferrer" aria-label={`Photo ${c.plate}`}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={photoUrl(c.photo_path)} alt="" loading="lazy" />
                        </a>
                      ) : (
                        <span className={v2.plateThumb} aria-hidden="true">
                          <Icon name="car" size={18} />
                        </span>
                      )}
                      <button type="button" className={v2.rowMain} onClick={() => setEditing({ ...c, price: String(c.price ?? '') })}>
                        <strong>
                          <span className={v2.plateTag}>{c.plate}</span> {c.model || ''}
                        </strong>
                        <span>
                          {PREP_LABEL[c.prep] || c.prep}
                          {c.notes ? ` · ${c.notes}` : ''}
                        </span>
                        {d && <em>{d.kind === 'facture' ? 'Facture' : 'Devis'} {d.number}</em>}
                      </button>
                      <strong>{euros2(c.price)}</strong>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))
        )}
      </section>

      <form className={styles.panel} onSubmit={saveRates}>
        <div className={styles.panelHead}>
          <h2>Tarifs {current}</h2>
        </div>
        <div className={styles.grid2}>
          {PREPS.filter((p) => p.id !== 'autre').map((p) => (
            <label className={styles.field} key={p.id}>
              {p.label} (€ HT)
              <input type="number" min="0" step="0.01" inputMode="decimal" value={rateForm[p.id] ?? ''} onChange={(e) => setRateForm({ ...rateForm, [p.id]: e.target.value })} placeholder="Ex. 45" />
            </label>
          ))}
        </div>
        <div className={styles.rowBtns}>
          <button type="submit" className={styles.btnSecondary}>
            Enregistrer les tarifs
          </button>
        </div>
        <p className={styles.hint}>Le prix se remplit tout seul quand vous scannez une voiture (modifiable au cas par cas).</p>
      </form>

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
      </form>

      {scan && (
        <PlateScan
          partner={current}
          file={scan.file}
          manual={!!scan.manual}
          cars={cars}
          settings={settings}
          onSave={onAddCar}
          onClose={() => setScan(null)}
        />
      )}

      {editing && (
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Modifier la voiture">
          <button type="button" className={styles.backdrop} onClick={() => setEditing(null)} aria-label="Fermer" />
          <form
            className={`${styles.sheet} ${styles.sheetSmall}`}
            onSubmit={async (e) => {
              e.preventDefault()
              const ok = await onUpdateCar(editing, {
                plate: formatPlate(editing.plate),
                model: editing.model?.trim() || null,
                prep: editing.prep,
                price: Number(editing.price) || 0,
                done_on: editing.done_on,
                notes: editing.notes?.trim() || null,
              })
              if (ok) setEditing(null)
            }}
          >
            <header className={styles.sheetHead}>
              <div>
                <h2>{editing.plate}</h2>
                <p>{editing.partner}</p>
              </div>
              <button type="button" className={styles.iconBtn} onClick={() => setEditing(null)} aria-label="Fermer">
                <Icon name="close" />
              </button>
            </header>
            <section className={styles.sheetSection}>
              <div className={styles.grid2}>
                <label className={styles.field}>
                  Plaque
                  <input className={v2.plateInput} value={editing.plate} onChange={(e) => setEditing({ ...editing, plate: typePlate(e.target.value) })} maxLength={20} required />
                </label>
                <label className={styles.field}>
                  Modèle
                  <input value={editing.model || ''} onChange={(e) => setEditing({ ...editing, model: e.target.value })} maxLength={80} />
                </label>
              </div>
              <div className={styles.chipsWrap}>
                {PREPS.map((p) => (
                  <button type="button" key={p.id} className={`${styles.chip} ${editing.prep === p.id ? styles.chipOn : ''}`} onClick={() => setEditing({ ...editing, prep: p.id })}>
                    {p.label}
                  </button>
                ))}
              </div>
              <div className={styles.grid2}>
                <label className={styles.field}>
                  Tarif (€ HT)
                  <input type="number" min="0" step="0.01" inputMode="decimal" value={editing.price} onChange={(e) => setEditing({ ...editing, price: e.target.value })} />
                </label>
                <label className={styles.field}>
                  Date
                  <input type="date" value={editing.done_on} onChange={(e) => setEditing({ ...editing, done_on: e.target.value })} />
                </label>
              </div>
              <label className={styles.field}>
                Note
                <input value={editing.notes || ''} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} maxLength={300} />
              </label>
              {editing.doc_id && docOf(editing.doc_id) && (
                <p className={styles.hint}>
                  Déjà sur la {docOf(editing.doc_id).kind} {docOf(editing.doc_id).number}.{' '}
                  <button type="button" className={styles.linkBtn} onClick={() => (setEditing(null), onOpenDoc(editing.doc_id))}>
                    Ouvrir
                  </button>
                </p>
              )}
              <div className={styles.rowBtns}>
                <button
                  type="button"
                  className={styles.linkDanger}
                  onClick={async () => {
                    if (!window.confirm(`Supprimer ${editing.plate} ?`)) return
                    if (await onDeleteCar(editing)) setEditing(null)
                  }}
                >
                  Supprimer
                </button>
                <button type="submit" className={styles.btnPrimary}>
                  Enregistrer
                </button>
              </div>
            </section>
          </form>
        </div>
      )}
    </div>
  )
}
