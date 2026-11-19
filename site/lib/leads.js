import emailjs from '@emailjs/browser'
import { LEADS_DB } from './constants'

// Envoi d'un prospect depuis les formulaires du site :
// 1. enregistré dans la base Supabase (table `leads`, lue par le dashboard) ;
// 2. notification email à Enzo via EmailJS (même modèle que le devis en ligne).
// Les deux partent en parallèle : la demande est considérée comme reçue dès que
// l'un des deux a fonctionné, pour ne jamais perdre un client à cause d'un
// service momentanément indisponible.

const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 'service_ugnog14'
const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || 'template_655hkaq'
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || 'SebLXFPtUd5Uj5qLX'

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

async function notifyByEmail(lead) {
  const recap = [
    `Prénom : ${lead.first_name}`,
    `Téléphone : ${lead.phone}`,
    lead.service && `Prestation : ${lead.service}`,
    lead.city && `Ville : ${lead.city}`,
    lead.vehicle && `Véhicule : ${lead.vehicle}`,
    lead.message && `Message : ${lead.message}`,
    `Formulaire : ${lead.source}`,
  ]
    .filter(Boolean)
    .join('\n')

  await emailjs.send(
    EMAILJS_SERVICE_ID,
    EMAILJS_TEMPLATE_ID,
    {
      type_vehicule: lead.vehicle || '',
      formule_habitacle: lead.service || '',
      prestations_complementaires: '',
      estimation_prix: 'Rappel demandé',
      recapitulatif_complet: recap,
      nom_complet: lead.first_name,
      telephone: lead.phone,
      email: lead.email || '',
      date_souhaitee: '',
      message: `Demande de rappel depuis le site (${lead.source})${lead.city ? ` — ${lead.city}` : ''}`,
      nombre_photos: '0',
      photos_liens: '',
      taille_flotte: '',
      frequence_entretien: '',
    },
    EMAILJS_PUBLIC_KEY
  )
}

export async function submitLead(raw) {
  const lead = normalizeLead(raw)
  const results = await Promise.allSettled([saveToDatabase(lead), notifyByEmail(lead)])
  results.forEach((r) => {
    if (r.status === 'rejected') console.error('[Prospect]', r.reason)
  })
  if (results.every((r) => r.status === 'rejected')) {
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
