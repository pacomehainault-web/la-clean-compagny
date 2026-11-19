'use client'

import { createClient } from '@supabase/supabase-js'
import { LEADS_DB } from './constants'

// Client Supabase du navigateur, utilisé par le dashboard (/admin).
// Connexion par lien envoyé par email ; l'accès aux prospects est limité par
// les règles de la base (RLS) aux emails de la table `team`.
let client

export function getSupabase() {
  if (!client) {
    client = createClient(LEADS_DB.url, LEADS_DB.publishableKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'implicit' },
    })
  }
  return client
}
