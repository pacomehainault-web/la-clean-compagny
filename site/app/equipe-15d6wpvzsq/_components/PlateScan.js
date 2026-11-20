'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import styles from '../admin.module.css'
import v2 from '../v2.module.css'
import { Icon } from './Icon'
import { euros, formatDate, toDateInput } from '../_lib/crm'
import { readPlate, typePlate, formatPlate, plateKey, warmUpPlateReader } from '../_lib/plate'

export const PREPS = [
  { id: 'parc', label: 'Préparation parc', short: 'Parc' },
  { id: 'vendue', label: 'Préparation vendue', short: 'Vendue' },
  { id: 'autre', label: 'Autre', short: 'Autre' },
]
export const PREP_LABEL = Object.fromEntries(PREPS.map((p) => [p.id, p.label]))

export function rateFor(settings, partner, prep) {
  const r = settings?.business?.partner_rates?.[partner]?.[prep]
  return r === undefined || r === null || r === '' ? null : Number(r)
}

// Scan d'une voiture de garage partenaire : photo de la plaque → lecture → modèle, préparation, tarif.
export default function PlateScan({ partner, file: firstFile, manual: startManual = false, cars, settings, onSave, onClose }) {
  const today = toDateInput(new Date().toISOString())
  const [file, setFile] = useState(firstFile || null)
  // Résultat de lecture, rattaché à la photo lue (la lecture est « en cours » tant qu'il ne correspond pas).
  const [result, setResult] = useState({ file: null, ok: null })
  const [plate, setPlate] = useState('')
  const [model, setModel] = useState('')
  const [prep, setPrep] = useState('parc')
  const [price, setPrice] = useState(() => {
    const r = rateFor(settings, partner, 'parc')
    return r === null ? '' : String(r)
  })
  const [priceTouched, setPriceTouched] = useState(false)
  const [day, setDay] = useState(today)
  const [notes, setNotes] = useState('')
  const [manual, setManual] = useState(startManual)
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState([])
  const plateRef = useRef(null)
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : ''), [file])
  const reading = !!file && result.file !== file
  const readMsg = file && result.file === file ? (result.ok ? 'ok' : 'fail') : ''

  useEffect(() => {
    warmUpPlateReader()
  }, [])


  const mine = useMemo(() => cars.filter((c) => c.partner === partner), [cars, partner])
  const models = useMemo(() => {
    const seen = new Map()
    for (const c of [...mine].sort((a, b) => (a.created_at < b.created_at ? 1 : -1))) {
      const m = (c.model || '').trim()
      if (m && !seen.has(m.toLowerCase())) seen.set(m.toLowerCase(), m)
    }
    return [...seen.values()].slice(0, 10)
  }, [mine])

  const key = plateKey(plate)
  const before = key.length >= 5 ? cars.filter((c) => plateKey(c.plate) === key).sort((a, b) => (a.done_on < b.done_on ? 1 : -1)) : []
  const sameDay = before.find((c) => c.done_on === day && c.partner === partner)
  const lastSeen = before[0]

  // Voiture déjà vue : on reprend son modèle.
  function changePlate(p) {
    setPlate(p)
    const k = plateKey(p)
    if (k.length < 7) return
    const seen = cars.filter((c) => plateKey(c.plate) === k && c.model).sort((a, b) => (a.done_on < b.done_on ? 1 : -1))[0]
    if (seen) setModel((m) => m || seen.model)
  }

  // Lecture de la plaque à chaque nouvelle photo.
  useEffect(() => {
    if (!file) return
    let alive = true
    readPlate(file)
      .then(({ plate: p }) => {
        if (!alive) return
        setResult({ file, ok: !!p })
        if (p) changePlate(p)
        else plateRef.current?.focus()
      })
      .catch(() => alive && setResult({ file, ok: false }))
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file])

  function choosePrep(id) {
    setPrep(id)
    if (!priceTouched) {
      const r = rateFor(settings, partner, id)
      setPrice(r === null ? '' : String(r))
    }
  }

  function dropPreview() {
    if (preview) URL.revokeObjectURL(preview)
  }

  function next(f) {
    dropPreview()
    setManual(false)
    setFile(f)
    setPlate('')
    setModel('')
    setNotes('')
  }

  async function submit(e) {
    e.preventDefault()
    const p = formatPlate(plate)
    if (!p) {
      plateRef.current?.focus()
      return
    }
    setBusy(true)
    const row = await onSave(
      { partner, plate: p, model: model.trim() || null, prep, price: Number(price) || 0, done_on: day || today, notes: notes.trim() || null },
      file
    )
    setBusy(false)
    if (row) {
      setSaved((s) => [row, ...s])
      dropPreview()
      setFile(null)
      setManual(false)
      setPlate('')
      setModel('')
      setNotes('')
    }
  }

  const todayCount = mine.filter((c) => c.done_on === (day || today)).length
  const rateMissing = rateFor(settings, partner, prep) === null

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Scanner une plaque">
      <button type="button" className={styles.backdrop} onClick={onClose} aria-label="Fermer" />
      <div className={`${styles.sheet} ${styles.sheetSmall}`}>
        <header className={styles.sheetHead}>
          <div>
            <h2>{partner}</h2>
            <p>
              {todayCount} voiture{todayCount > 1 ? 's' : ''} le {formatDate(day || today, { day: 'numeric', month: 'long' })}
            </p>
          </div>
          <button type="button" className={styles.iconBtn} onClick={onClose} aria-label="Fermer">
            <Icon name="close" />
          </button>
        </header>

        {saved.length > 0 && !file && (
          <section className={styles.sheetSection}>
            <p className={styles.okText}>
              ✓ {saved[0].plate}
              {saved[0].model ? ` · ${saved[0].model}` : ''} enregistrée ({euros(saved[0].price)})
              {saved.length > 1 ? ` · ${saved.length} voitures d'affilée` : ''}
            </p>
          </section>
        )}

        {!file && !manual ? (
          <section className={styles.sheetSection}>
            <label className={v2.scanBig}>
              <Icon name="camera" size={28} />
              <span>{saved.length ? 'Voiture suivante' : 'Photo de la plaque'}</span>
              <em>Cadrez la plaque bien au centre, de près</em>
              <input type="file" accept="image/*" capture="environment" onChange={(e) => e.target.files?.[0] && next(e.target.files[0])} hidden />
            </label>
            <button type="button" className={`${styles.linkBtn} ${v2.scanManual}`} onClick={() => setManual(true)}>
              Saisir sans photo
            </button>
            {saved.length > 0 && (
              <button type="button" className={`${styles.btnSecondary} ${styles.btnBlock}`} onClick={onClose}>
                Terminer
              </button>
            )}
          </section>
        ) : null}

        {(file || manual) && (
          <form className={styles.sheetSection} onSubmit={submit}>
            {preview && (
              <div className={v2.scanPreview}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="Photo de la plaque" />
                {reading && <span className={v2.scanReading}>Lecture de la plaque…</span>}
              </div>
            )}
            <label className={styles.field}>
              Plaque
              <input
                ref={plateRef}
                className={v2.plateInput}
                value={plate}
                onChange={(e) => changePlate(typePlate(e.target.value))}
                placeholder={reading ? 'Lecture…' : 'AB-123-CD'}
                autoCapitalize="characters"
                autoComplete="off"
                spellCheck={false}
                maxLength={20}
                required
              />
            </label>
            {readMsg === 'ok' && <p className={styles.hint}>Plaque lue automatiquement : vérifiez-la d&apos;un coup d&apos;œil.</p>}
            {readMsg === 'fail' && <p className={styles.textWarn}>Plaque pas lue sur la photo : tapez-la (sur iPhone, « Scanner du texte » au-dessus du clavier marche aussi).</p>}
            {sameDay && <p className={styles.textWarn}>Attention : {sameDay.plate} est déjà enregistrée ce jour-là chez {partner}.</p>}
            {!sameDay && lastSeen && (
              <p className={styles.hint}>
                Déjà passée le {formatDate(lastSeen.done_on, { day: 'numeric', month: 'short' })} ({lastSeen.partner}
                {lastSeen.model ? `, ${lastSeen.model}` : ''}).
              </p>
            )}

            <label className={styles.field}>
              Modèle
              <input value={model} onChange={(e) => setModel(e.target.value)} placeholder="Ex. BMW X1, Série 3…" maxLength={80} />
            </label>
            {models.length > 0 && (
              <div className={styles.chipsWrap}>
                {models.map((m) => (
                  <button type="button" key={m} className={`${styles.chip} ${model === m ? styles.chipOn : ''}`} onClick={() => setModel(m)}>
                    {m}
                  </button>
                ))}
              </div>
            )}

            <div className={styles.field}>
              Préparation
              <div className={styles.chipsWrap}>
                {PREPS.map((p) => (
                  <button type="button" key={p.id} className={`${styles.chip} ${prep === p.id ? styles.chipOn : ''}`} onClick={() => choosePrep(p.id)}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.grid2}>
              <label className={styles.field}>
                Tarif (€)
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  value={price}
                  onChange={(e) => {
                    setPrice(e.target.value)
                    setPriceTouched(true)
                  }}
                />
              </label>
              <label className={styles.field}>
                Date
                <input type="date" value={day} max={today} onChange={(e) => setDay(e.target.value)} />
              </label>
            </div>
            {rateMissing && <p className={styles.hint}>Astuce : enregistrez vos tarifs {partner} en bas de l&apos;écran Garages, le prix se mettra tout seul.</p>}
            <label className={styles.field}>
              Note (facultatif)
              <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ex. jantes en plus, très sale…" maxLength={300} />
            </label>

            <div className={styles.rowBtns}>
              {file && (
                <label className={styles.btnSecondary}>
                  <Icon name="camera" size={16} /> Reprendre
                  <input type="file" accept="image/*" capture="environment" onChange={(e) => e.target.files?.[0] && (dropPreview(), setFile(e.target.files[0]))} hidden />
                </label>
              )}
              <button type="submit" className={styles.btnPrimary} disabled={busy || !plate}>
                {busy ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
