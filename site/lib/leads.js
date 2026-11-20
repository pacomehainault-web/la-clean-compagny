import { LEADS_DB } from './constants'
import { storedReferral } from './booking'

// Envoi d'un prospect depuis les formulaires du site : enregistré dans la
// base Supabase (table `leads`), lue par le dashboard. Pas d'email : tout se
// gère depuis le dashboard.

function clean(value, max) {
  if (typeof value !== 'string') return null
  const v = value.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max)
  return v || null
}

export function normalizeLead(raw) {
  return {
    first_name: clean(raw.firstName, 80),
    phone: clean(raw.phone, 40),
    email: clean(raw.email, 254),
    service: clean(raw.service, 120),
    city: clean(raw.city, 120),
    vehicle: clean(raw.vehicle, 300),
    message: clean(raw.message, 3000),
    source: clean(raw.source, 120) || 'site',
    consent_relance: Boolean(raw.consentRelance),
    ref_code: clean(raw.refCode ?? storedReferral(), 20),
  }
}

// Téléphone français (06 12 34 56 78, +33 6…, avec ou sans espaces/points).
export function isValidPhone(phone) {
  const digits = (phone || '').replace(/[^\d+]/g, '')
  return /^(?:\+33|0033|0)[1-9]\d{8}$/.test(digits)
}

async function saveToDatabase(lead) {
  const res = await fetch(`${LEADS_DB.url}/rest/v1/leads`, {
    method: 'POST',
    headers: {
      apikey: LEADS_DB.publishableKey,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(lead),
  })
  if (!res.ok) throw new Error(`Base prospects : HTTP ${res.status}`)
}

export async function submitLead(raw) {
  const lead = normalizeLead(raw)
  try {
    await saveToDatabase(lead)
  } catch (err) {
    console.error('[Prospect]', err)
    throw new Error("La demande n'a pas pu être envoyée.")
  }
  // Mesure de conversion (Google Analytics, seulement si l'utilisateur a accepté).
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', 'generate_lead', { form_source: lead.source })
  }
}

// Enregistre seulement le prospect dans la base (sans email) : utilisé par le
// devis en ligne, qui envoie déjà son propre email détaillé à Enzo.
export async function recordLead(raw) {
  try {
    await saveToDatabase(normalizeLead(raw))
  } catch (err) {
    console.error('[Prospect]', err)
  }
}
