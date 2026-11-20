'use client'

import { useEffect, useId, useRef, useState } from 'react'
import styles from './AddressAutocomplete.module.css'

// Champ d'adresse avec suggestions d'adresses réelles (Base Adresse Nationale,
// API Géoplateforme de l'IGN : gratuite, sans clé). Les adresses proches
// d'Angers passent en premier. Choisir une suggestion remplit l'adresse,
// la ville et les coordonnées GPS.

const API = 'https://data.geopf.fr/geocodage/search'
const ANGERS = { lat: 47.4784, lng: -0.5632 }

export async function searchAddresses(q, signal) {
  const params = new URLSearchParams({ q, limit: '15', autocomplete: '1', lat: ANGERS.lat, lon: ANGERS.lng })
  const res = await fetch(`${API}?${params}`, { signal })
  if (!res.ok) return []
  const j = await res.json()
  const items = (j.features || []).map((f) => {
    const p = f.properties || {}
    const street = p.type === 'housenumber' || p.type === 'street' ? p.name : p.type === 'locality' ? p.name : ''
    return {
      id: p.id || p.label,
      label: p.label,
      address: street,
      city: p.city || '',
      postcode: p.postcode || '',
      lat: f.geometry?.coordinates?.[1] ?? null,
      lng: f.geometry?.coordinates?.[0] ?? null,
      near: typeof p.distance === 'number' ? p.distance < 60000 : String(p.postcode || '').startsWith('49'),
      distance: typeof p.distance === 'number' ? p.distance : null,
      type: p.type,
    }
  })
  // Autour d'Angers d'abord (dans l'ordre de pertinence), puis le reste.
  const near = items.filter((i) => i.near)
  const far = items.filter((i) => !i.near)
  return [...near, ...far].slice(0, 6)
}

export default function AddressAutocomplete({ value, onChange, onSelect, inputClassName = '', placeholder = 'N°, rue', id, required = false, autoComplete = 'off', maxLength = 300 }) {
  const [items, setItems] = useState([])
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const [loading, setLoading] = useState(false)
  const timer = useRef(null)
  const ctrl = useRef(null)
  const picked = useRef(false)
  const autoId = useId()
  const listId = `${id || autoId}-suggestions`

  useEffect(
    () => () => {
      clearTimeout(timer.current)
      ctrl.current?.abort()
    },
    []
  )

  function query(text) {
    clearTimeout(timer.current)
    ctrl.current?.abort()
    if (text.trim().length < 3) {
      setItems([])
      setOpen(false)
      setLoading(false)
      return
    }
    setLoading(true)
    timer.current = setTimeout(async () => {
      const c = new AbortController()
      ctrl.current = c
      try {
        const res = await searchAddresses(text.trim(), c.signal)
        setItems(res)
        setActive(-1)
        setOpen(true)
      } catch {
        // requête annulée ou hors ligne : on garde la saisie libre
      }
      setLoading(false)
    }, 220)
  }

  function change(e) {
    picked.current = false
    onChange(e.target.value)
    query(e.target.value)
  }

  function pick(item) {
    picked.current = true
    setOpen(false)
    setItems([])
    onSelect?.(item)
    if (!onSelect) onChange(item.label)
  }

  function key(e) {
    if (!open || !items.length) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => (a + 1) % items.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => (a <= 0 ? items.length - 1 : a - 1))
    } else if (e.key === 'Enter' && active >= 0) {
      e.preventDefault()
      pick(items[active])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div className={styles.wrap}>
      <input
        id={id}
        className={inputClassName}
        value={value}
        onChange={change}
        onKeyDown={key}
        onFocus={() => items.length && !picked.current && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        maxLength={maxLength}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
      />
      {loading && <span className={styles.spin} aria-hidden="true" />}
      {open && (
        <ul className={styles.list} id={listId} role="listbox">
          {items.length === 0 ? (
            <li className={styles.empty}>Aucune adresse trouvée, vous pouvez la taper en entier.</li>
          ) : (
            items.map((it, i) => (
              <li key={it.id} id={`${listId}-${i}`} role="option" aria-selected={i === active}>
                <button type="button" className={i === active ? styles.on : ''} onMouseDown={(e) => e.preventDefault()} onClick={() => pick(it)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" />
                    <circle cx="12" cy="9.5" r="2.5" />
                  </svg>
                  <span>
                    <strong>{it.address || it.city}</strong>
                    <em>{[it.postcode, it.city].filter(Boolean).join(' ')}</em>
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}
