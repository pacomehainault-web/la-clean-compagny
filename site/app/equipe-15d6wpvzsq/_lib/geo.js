'use client'

// Météo (Open-Meteo, gratuit, sans clé) et géocodage des adresses
// (Nominatim / OpenStreetMap) pour la tournée et les kilomètres.

import { useEffect, useState } from 'react'

const ANGERS = { lat: 47.4784, lng: -0.5632 }
const WEATHER_KEY = 'lcc-weather-v1'

export async function fetchForecast() {
  try {
    const cached = JSON.parse(sessionStorage.getItem(WEATHER_KEY) || 'null')
    if (cached && Date.now() - cached.at < 3600000) return cached.data
  } catch {}
  const params = new URLSearchParams({
    latitude: ANGERS.lat,
    longitude: ANGERS.lng,
    daily: 'precipitation_probability_max,precipitation_sum,temperature_2m_max,weather_code',
    hourly: 'precipitation_probability,precipitation',
    timezone: 'Europe/Paris',
    forecast_days: '10',
  })
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`)
  if (!res.ok) throw new Error('meteo')
  const j = await res.json()
  const days = {}
  j.daily.time.forEach((d, i) => {
    days[d] = {
      prob: j.daily.precipitation_probability_max[i],
      mm: j.daily.precipitation_sum[i],
      tmax: Math.round(j.daily.temperature_2m_max[i]),
      code: j.daily.weather_code[i],
    }
  })
  const hours = {}
  j.hourly.time.forEach((t, i) => {
    hours[t] = { prob: j.hourly.precipitation_probability[i], mm: j.hourly.precipitation[i] }
  })
  const data = { days, hours }
  try {
    sessionStorage.setItem(WEATHER_KEY, JSON.stringify({ at: Date.now(), data }))
  } catch {}
  return data
}

export function useForecast() {
  const [fc, setFc] = useState(null)
  useEffect(() => {
    let cancelled = false
    fetchForecast()
      .then((d) => !cancelled && setFc(d))
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])
  return fc
}

const pad = (n) => String(n).padStart(2, '0')
const dayKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export function dayWeather(fc, date) {
  if (!fc) return null
  return fc.days[dayKey(new Date(date))] || null
}

// Risque de pluie sur la durée d'un RDV : probabilité max et cumul (mm).
export function slotRain(fc, startIso, minutes = 120) {
  if (!fc || !startIso) return null
  const start = new Date(startIso)
  let prob = null
  let mm = 0
  for (let t = 0; t < Math.max(60, minutes); t += 60) {
    const d = new Date(start.getTime() + t * 60000)
    const k = `${dayKey(d)}T${pad(d.getHours())}:00`
    const h = fc.hours[k]
    if (!h) continue
    prob = Math.max(prob ?? 0, h.prob ?? 0)
    mm += h.mm || 0
  }
  if (prob == null) {
    const day = dayWeather(fc, start)
    return day ? { prob: day.prob, mm: day.mm } : null
  }
  return { prob, mm: Math.round(mm * 10) / 10 }
}

export function weatherEmoji(code) {
  if (code == null) return ''
  if (code === 0) return '☀️'
  if (code <= 2) return '🌤️'
  if (code === 3) return '☁️'
  if (code <= 48) return '🌫️'
  if (code <= 67 || (code >= 80 && code <= 82)) return '🌧️'
  if (code <= 77 || code === 85 || code === 86) return '❄️'
  return '⛈️'
}

// ---------- Géocodage ----------
const GEO_KEY = 'lcc-geo-v1'

function geoCache() {
  try {
    return JSON.parse(localStorage.getItem(GEO_KEY) || '{}')
  } catch {
    return {}
  }
}

export async function geocode(address) {
  const q = (address || '').trim()
  if (q.length < 3) return null
  const cache = geoCache()
  if (cache[q]) return cache[q]
  // Base Adresse Nationale (IGN) : précise pour les adresses françaises.
  const { searchAddresses } = await import('@/components/AddressAutocomplete')
  const res = await searchAddresses(q).catch(() => [])
  const first = res.find((r) => r.lat != null)
  const hit = first ? { lat: first.lat, lng: first.lng } : null
  if (hit) {
    cache[q] = hit
    try {
      localStorage.setItem(GEO_KEY, JSON.stringify(cache))
    } catch {}
  }
  return hit
}

// Complète lat/lng des clients d'une liste (et les enregistre dans la fiche).
export async function ensureCoords(leads, saveLead) {
  const out = new Map()
  for (const l of leads) {
    if (l.lat != null && l.lng != null) {
      out.set(l.id, { lat: l.lat, lng: l.lng })
      continue
    }
    const q = [l.address, l.city].filter(Boolean).join(', ')
    if (!q) continue
    try {
      const hit = await geocode(q)
      if (hit) {
        out.set(l.id, hit)
        saveLead?.(l, { lat: hit.lat, lng: hit.lng })
      }
    } catch {}
  }
  return out
}

export { ANGERS }
