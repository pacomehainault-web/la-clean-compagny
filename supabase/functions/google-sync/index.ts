// Relevé Google quotidien pour le dashboard La Clean Compagny.
//  - Search Console (compte de service) : clics, impressions, position, CTR par jour
//    + position des requêtes locales (« ... angers », villes autour).
//  - Google Places (clé API) : note et nombre d'avis de La Clean et de FreshInside
//    (alimente le Duel), avis récents de La Clean.
// Appelée chaque matin par pg_cron (en-tête x-sync-secret) ou depuis l'appli
// par un membre de l'équipe connecté (bouton « Actualiser »).
// Secrets attendus (Supabase > Edge Functions > Secrets) :
//   GSC_SERVICE_ACCOUNT  = contenu JSON de la clé du compte de service
//   GOOGLE_PLACES_KEY    = clé API restreinte à « Places API (New) »

import { createClient } from 'npm:@supabase/supabase-js@2'

const SITE = 'sc-domain:lacleancompagny.com'
const OUR_QUERY = 'La Clean Compagny Angers'
const RIVAL_QUERY = 'FreshInside Angers nettoyage voiture'
const LOCAL = /angers|trélazé|trelaze|avrillé|avrille|beaucouzé|beaucouze|ponts-de-cé|ponts de ce|saint-barthélemy|bouchemaine|écouflant|ecouflant|loir/i
const TRACKED = [
  'nettoyage voiture angers',
  'nettoyage voiture domicile angers',
  'nettoyage intérieur voiture angers',
  'lavage voiture domicile angers',
  'lavage voiture angers',
  'detailing angers',
]

const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
  auth: { persistSession: false },
})

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-sync-secret',
}

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })

const parisDay = (d = new Date()) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris' }).format(d)
const daysAgo = (n: number) => parisDay(new Date(Date.now() - n * 86400000))

async function authorized(req: Request) {
  const secret = req.headers.get('x-sync-secret')
  if (secret) {
    const { data } = await admin.rpc('sync_check', { p_secret: secret })
    return data === true
  }
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '')
  if (!token) return false
  const { data } = await admin.auth.getUser(token)
  const email = data?.user?.email?.toLowerCase()
  if (!email) return false
  const { data: member } = await admin.from('team').select('email').eq('email', email).maybeSingle()
  return Boolean(member)
}

// ---------- Search Console ----------
function b64url(input: ArrayBuffer | string) {
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : new Uint8Array(input)
  let s = ''
  bytes.forEach((b) => (s += String.fromCharCode(b)))
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function googleToken(sa: { client_email: string; private_key: string }, scope: string) {
  const pem = sa.private_key.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '')
  const der = Uint8Array.from(atob(pem), (c) => c.charCodeAt(0))
  const key = await crypto.subtle.importKey('pkcs8', der, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign'])
  const now = Math.floor(Date.now() / 1000)
  const unsigned = `${b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))}.${b64url(
    JSON.stringify({ iss: sa.client_email, scope, aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 })
  )}`
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(unsigned))
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${unsigned}.${b64url(sig)}` }),
  })
  const j = await res.json()
  if (!res.ok) throw new Error(`token: ${j.error_description || j.error || res.status}`)
  return j.access_token as string
}

async function gscQuery(token: string, body: Record<string, unknown>) {
  const res = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}/searchAnalytics/query`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const j = await res.json()
  if (!res.ok) throw new Error(`search console: ${j.error?.message || res.status}`)
  return (j.rows || []) as { keys: string[]; clicks: number; impressions: number; ctr: number; position: number }[]
}

async function syncSearchConsole() {
  const raw = Deno.env.get('GSC_SERVICE_ACCOUNT')
  if (!raw) return { skipped: 'GSC_SERVICE_ACCOUNT manquant' }
  const sa = JSON.parse(raw)
  const token = await googleToken(sa, 'https://www.googleapis.com/auth/webmasters.readonly')
  const rows: { day: string; source: string; metric: string; value: number }[] = []

  const byDay = await gscQuery(token, { startDate: daysAgo(16), endDate: daysAgo(1), dimensions: ['date'], type: 'web', dataState: 'all' })
  for (const r of byDay) {
    const day = r.keys[0]
    rows.push(
      { day, source: 'gsc', metric: 'clics', value: r.clicks },
      { day, source: 'gsc', metric: 'impressions', value: r.impressions },
      { day, source: 'gsc', metric: 'position', value: Math.round(r.position * 10) / 10 },
      { day, source: 'gsc', metric: 'ctr', value: Math.round(r.ctr * 1000) / 10 }
    )
  }

  const today = parisDay()
  const byQuery = await gscQuery(token, { startDate: daysAgo(8), endDate: daysAgo(1), dimensions: ['query'], type: 'web', rowLimit: 500, dataState: 'all' })
  let queries = 0
  for (const r of byQuery) {
    const q = r.keys[0].toLowerCase()
    if (TRACKED.includes(q) || (LOCAL.test(q) && r.impressions >= 3)) {
      rows.push({ day: today, source: 'gsc', metric: `pos:${q}`, value: Math.round(r.position * 10) / 10 })
      queries++
    }
  }
  if (rows.length) {
    const { error } = await admin.from('stats_daily').upsert(rows, { onConflict: 'day,source,metric' })
    if (error) throw new Error(`base: ${error.message}`)
  }
  return { days: byDay.length, queries }
}

// ---------- Google Places ----------
async function placesSearch(key: string, textQuery: string) {
  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: { 'X-Goog-Api-Key': key, 'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress', 'Content-Type': 'application/json' },
    body: JSON.stringify({ textQuery, languageCode: 'fr', regionCode: 'FR', locationBias: { circle: { center: { latitude: 47.4784, longitude: -0.5632 }, radius: 30000 } } }),
  })
  const j = await res.json()
  if (!res.ok) throw new Error(`places: ${j.error?.message || res.status}`)
  return j.places?.[0] || null
}

async function placeDetails(key: string, id: string, withReviews: boolean) {
  const res = await fetch(`https://places.googleapis.com/v1/places/${id}?languageCode=fr`, {
    headers: { 'X-Goog-Api-Key': key, 'X-Goog-FieldMask': `id,displayName,rating,userRatingCount${withReviews ? ',reviews' : ''}` },
  })
  const j = await res.json()
  if (!res.ok) throw new Error(`places: ${j.error?.message || res.status}`)
  return j
}

async function syncPlaces() {
  const key = Deno.env.get('GOOGLE_PLACES_KEY')
  if (!key) return { skipped: 'GOOGLE_PLACES_KEY manquant' }
  const { data: st } = await admin.from('settings').select('business').eq('id', 1).single()
  const biz = st?.business || {}
  const ids = { ...(biz.places || {}) }
  if (!ids.lc) ids.lc = (await placesSearch(key, OUR_QUERY))?.id
  if (!ids.fi) ids.fi = (await placesSearch(key, RIVAL_QUERY))?.id
  if (JSON.stringify(ids) !== JSON.stringify(biz.places || {})) {
    await admin.from('settings').update({ business: { ...biz, places: ids } }).eq('id', 1)
  }
  const today = parisDay()
  const rows: { day: string; source: string; metric: string; value: number }[] = []
  let reviews = 0
  if (ids.lc) {
    const lc = await placeDetails(key, ids.lc, true)
    if (lc.userRatingCount != null) rows.push({ day: today, source: 'duel', metric: 'lc_avis', value: lc.userRatingCount }, { day: today, source: 'gbp', metric: 'avis_total', value: lc.userRatingCount })
    if (lc.rating != null) rows.push({ day: today, source: 'duel', metric: 'lc_note', value: lc.rating }, { day: today, source: 'gbp', metric: 'note_moyenne', value: lc.rating })
    const list = (lc.reviews || []).map((r: any) => ({
      id: `places:${r.name?.split('/').pop() || crypto.randomUUID()}`,
      author: r.authorAttribution?.displayName || 'Client Google',
      rating: r.rating ?? null,
      body: r.originalText?.text || r.text?.text || null,
      review_date: r.publishTime ? r.publishTime.slice(0, 10) : null,
      fetched_at: new Date().toISOString(),
    }))
    for (const rv of list) {
      // Un avis déjà connu sous le même auteur (relevé par le Mac) n'est pas doublé.
      const { data: same } = await admin.from('google_reviews').select('id').eq('author', rv.author).limit(1)
      if (same?.length && same[0].id !== rv.id) continue
      const { error } = await admin.from('google_reviews').upsert(rv, { onConflict: 'id', ignoreDuplicates: false })
      if (!error) reviews++
    }
  }
  if (ids.fi) {
    const fi = await placeDetails(key, ids.fi, false)
    if (fi.userRatingCount != null) rows.push({ day: today, source: 'duel', metric: 'fi_avis', value: fi.userRatingCount })
    if (fi.rating != null) rows.push({ day: today, source: 'duel', metric: 'fi_note', value: fi.rating })
  }
  if (rows.length) {
    const { error } = await admin.from('stats_daily').upsert(rows, { onConflict: 'day,source,metric' })
    if (error) throw new Error(`base: ${error.message}`)
  }
  return { places: ids, reviews, metrics: rows.length }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (!(await authorized(req))) return json({ error: 'forbidden' }, 403)
  const out: Record<string, unknown> = { at: new Date().toISOString() }
  try {
    out.searchConsole = await syncSearchConsole()
  } catch (e) {
    out.searchConsole = { error: String((e as Error).message || e) }
  }
  try {
    out.places = await syncPlaces()
  } catch (e) {
    out.places = { error: String((e as Error).message || e) }
  }
  await admin.from('stats_daily').upsert({ day: parisDay(), source: 'sync', metric: 'last_run', value: Date.now() / 1000 }, { onConflict: 'day,source,metric' })
  await admin.from('sync_log').insert({ result: out })
  return json(out)
})
