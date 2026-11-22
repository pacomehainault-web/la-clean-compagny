// Origine des demandes : d'où vient la personne qui remplit un formulaire ou
// réserve en ligne (pub Meta, Google Ads, fiche Google, Google naturel,
// réseaux sociaux…). Lue dans l'URL d'arrivée (utm_*, gclid, fbclid) et dans
// le site d'origine, gardée 30 jours dans le navigateur du visiteur, et
// envoyée UNIQUEMENT avec un formulaire qu'il remplit lui-même. Aucun
// identifiant, aucune donnée envoyée à un tiers.
//
// Liens de pub à utiliser :
//   Meta   : ?utm_source=meta&utm_medium=paid&utm_campaign=<nom>
//   Google : gclid ajouté tout seul par Google Ads (suivi automatique)
//   Fiche Google (site web / posts) : ?utm_source=gbp&utm_medium=organic&utm_campaign=<nom>

const KEY = 'lcc-attrib'
const TTL_DAYS = 30
const PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']
const CLICK_IDS = ['gclid', 'gbraid', 'wbraid', 'fbclid']

export const CHANNELS = {
  meta_ads: 'Pub Meta (Insta / Facebook)',
  google_ads: 'Google Ads',
  fiche_google: 'Fiche Google',
  google: 'Google (naturel)',
  reseaux: 'Réseaux sociaux (sans pub)',
  autre_site: 'Autre site',
  telephone: 'Appel / WhatsApp',
  bouche_a_oreille: 'Bouche-à-oreille',
  partenaire: 'Garage partenaire',
  direct: 'Site – origine inconnue',
  autre: 'Autre',
}

const SOCIAL = /(^|\.)(facebook|instagram|tiktok|linkedin|snapchat|pinterest|youtube|threads)\.|(^|\.)(t\.co|x\.com|l\.facebook\.com|lm\.facebook\.com|l\.instagram\.com)$/
const META_SOURCES = ['meta', 'facebook', 'fb', 'instagram', 'ig', 'insta']
const PAID = /^(paid|cpc|ppc|ads?|paid_social|paidsocial|sponsored|boost)$/

const clip = (v, n = 120) => (typeof v === 'string' ? v.slice(0, n) : null)

// Canal d'une « touche » (une arrivée sur le site avec une origine connue).
export function channelOf(t) {
  if (!t) return 'direct'
  const src = (t.source || '').toLowerCase()
  const med = (t.medium || '').toLowerCase()
  const camp = (t.campaign || '').toLowerCase()
  if (src === 'meta' || (META_SOURCES.includes(src) && PAID.test(med))) return 'meta_ads'
  if (t.click === 'gclid' || t.click === 'gbraid' || t.click === 'wbraid' || (['google', 'adwords', 'googleads'].includes(src) && PAID.test(med))) return 'google_ads'
  if (['gbp', 'gmb', 'google_business', 'fiche_google', 'googlemybusiness'].includes(src) || /gbp|gmb|business/.test(med) || /^(gbp|fiche)/.test(camp)) return 'fiche_google'
  if (src) {
    if (META_SOURCES.includes(src) || ['tiktok', 'linkedin', 'snapchat', 'youtube', 'pinterest'].includes(src)) return 'reseaux'
    if (src === 'google') return 'google'
    return 'autre_site'
  }
  if (t.click === 'fbclid') return 'reseaux'
  const ref = (t.ref || '').toLowerCase()
  if (ref) {
    if (/(^|\.)google\./.test(ref)) return 'google'
    if (SOCIAL.test(ref)) return 'reseaux'
    return 'autre_site'
  }
  return 'direct'
}

function readStore() {
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    const at = Date.parse(data?.last?.at || '')
    if (!at || Date.now() - at > TTL_DAYS * 86400000) {
      window.localStorage.removeItem(KEY)
      return null
    }
    return data
  } catch {
    return null
  }
}

// À appeler à chaque page vue : n'enregistre que les arrivées avec une
// origine (paramètres de campagne ou site extérieur), jamais la navigation interne.
export function captureAttribution() {
  if (typeof window === 'undefined') return
  try {
    const url = new URL(window.location.href)
    const touch = {}
    for (const p of PARAMS) {
      const v = url.searchParams.get(p)
      if (v) touch[p.replace('utm_', '')] = clip(v.trim(), 100)
    }
    const click = CLICK_IDS.find((p) => url.searchParams.get(p))
    if (click) touch.click = click
    let ref = null
    if (document.referrer) {
      const host = new URL(document.referrer).hostname
      if (!host.endsWith('lacleancompagny.com') && host !== window.location.hostname) ref = clip(host, 80)
    }
    if (ref) touch.ref = ref
    if (!Object.keys(touch).length) return
    // Une arrivée sans paramètres depuis Google ne doit pas effacer une pub cliquée juste avant.
    const prev = readStore()
    const next = { ...touch, landing: clip(url.pathname, 120), at: new Date().toISOString() }
    next.channel = channelOf(next)
    if (prev?.last && !touch.source && !touch.click && ['meta_ads', 'google_ads'].includes(prev.last.channel)) {
      const age = Date.now() - Date.parse(prev.last.at)
      if (age < 7 * 86400000) return
    }
    window.localStorage.setItem(KEY, JSON.stringify({ first: prev?.first || next, last: next }))
  } catch {}
}

// Ce qui part avec un formulaire : première et dernière origine connues.
export function attributionForLead() {
  if (typeof window === 'undefined') return null
  const data = readStore()
  if (!data?.last) return null
  return { first: data.first || data.last, last: data.last, page: clip(window.location.pathname, 120) }
}

// Canal d'une demande déjà enregistrée (site, réservation ou saisie à la main).
export function leadChannel(lead) {
  const last = lead?.attribution?.last
  if (last) return last.channel && CHANNELS[last.channel] ? last.channel : channelOf(last)
  const s = lead?.source || ''
  if (s === 'telephone' || s === 'whatsapp') return 'telephone'
  if (s === 'instagram') return 'reseaux'
  if (s === 'google') return 'fiche_google'
  if (s === 'bouche-a-oreille') return 'bouche_a_oreille'
  if (s === 'partenaire' || lead?.partner) return 'partenaire'
  if (s === 'autre') return 'autre'
  return 'direct'
}

export function channelLabel(id) {
  return CHANNELS[id] || id
}
