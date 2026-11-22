import { createClient } from '@supabase/supabase-js'
import { LEADS_DB } from '../constants'

// Vérifie que la requête vient d'un membre de l'équipe (session Supabase du dashboard)
// et renvoie un client Supabase qui agit avec SES droits (règles RLS).
export async function teamClient(request) {
  const auth = request.headers.get('authorization') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  if (!token) return null
  const db = createClient(LEADS_DB.url, LEADS_DB.publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  })
  const { data, error } = await db.from('team').select('email').limit(1)
  if (error || !data?.length) return null
  return db
}

export async function logoBytes(request) {
  try {
    const r = await fetch(new URL('/images/logo/logo-facture.jpg', request.url))
    return r.ok ? new Uint8Array(await r.arrayBuffer()) : null
  } catch {
    return null
  }
}
