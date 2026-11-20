// Réservation en ligne et page de suivi : appels publics à la base
// (fonctions SQL sécurisées, aucune donnée client lisible en dehors du lien secret).

import { LEADS_DB } from './constants'
import { WORK_START, WORK_END } from './catalog'

async function rpc(name, body) {
  const res = await fetch(`${LEADS_DB.url}/rest/v1/rpc/${name}`, {
    method: 'POST',
    headers: { apikey: LEADS_DB.publishableKey, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  })
  const text = await res.text()
  const data = text ? JSON.parse(text) : null
  if (!res.ok) {
    const err = new Error((data && data.message) || `HTTP ${res.status}`)
    err.code = data?.message
    throw err
  }
  return data
}

export const getTracking = (token) => rpc('get_tracking', { p_token: token })
export const acceptQuote = (token, docId) => rpc('accept_quote', { p_token: token, p_doc: docId })
export const fetchBusy = (fromIso, days = 21) => rpc('public_busy', { p_from: fromIso, p_days: days })
export const bookSlot = (payload) => rpc('book_slot', payload)

export const BOOKING_ERRORS = {
  pris: 'Ce créneau vient d’être pris. Choisissez-en un autre.',
  limite: 'Vous avez déjà réservé aujourd’hui. Pour un autre RDV, appelez-nous directement.',
  telephone: 'Vérifiez votre numéro de téléphone.',
  adresse: 'Indiquez l’adresse où se trouve le véhicule.',
  nom: 'Indiquez votre nom.',
  date: 'Ce créneau n’est plus disponible.',
  dimanche: 'Nous ne travaillons pas le dimanche.',
  horaires: 'Ce créneau dépasse nos horaires.',
}

const TRAVEL = 30 // minutes de trajet laissées entre deux clients

// Heures de début libres pour un jour donné (pas de 30 min).
export function freeSlots(busy, day, minutes, now = new Date()) {
  const out = []
  if (day.getDay() === 0) return out
  const earliest = now.getTime() + 3 * 3600000
  for (let h = WORK_START; h + minutes / 60 <= WORK_END; h += 0.5) {
    const d = new Date(day)
    d.setHours(Math.floor(h), (h % 1) * 60, 0, 0)
    const s = d.getTime()
    if (s < earliest) continue
    const e = s + (minutes + TRAVEL) * 60000
    const clash = busy.some((b) => new Date(b.s).getTime() < e && new Date(b.e).getTime() > s)
    if (!clash) out.push(d)
  }
  return out
}

// Fichier .ics pour ajouter le RDV à l'agenda du téléphone.
export function icsFile({ title, start, minutes, location, description }) {
  const stamp = (d) => new Date(d).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const end = new Date(new Date(start).getTime() + minutes * 60000)
  const esc = (v) => String(v || '').replace(/[\\,;]/g, (m) => `\\${m}`).replace(/\n/g, '\\n')
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//La Clean Compagny//FR',
    'BEGIN:VEVENT',
    `UID:${stamp(start)}-${Math.random().toString(36).slice(2)}@lacleancompagny.com`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${esc(title)}`,
    `LOCATION:${esc(location)}`,
    `DESCRIPTION:${esc(description)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}

// Code parrain reçu par lien (?parrain=XXXX), gardé pour le formulaire.
export function storedReferral() {
  try {
    return localStorage.getItem('lcc-parrain') || ''
  } catch {
    return ''
  }
}

export function rememberReferral(code) {
  const c = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12)
  if (!c) return
  try {
    localStorage.setItem('lcc-parrain', c)
  } catch {}
}
