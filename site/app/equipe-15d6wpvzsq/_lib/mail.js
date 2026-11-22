'use client'

import { useEffect, useState } from 'react'

// L'envoi direct par mail (Gmail d'Enzo) est-il configuré ? Une seule vérification par visite.
let cached = null

export function useMailReady() {
  const [ready, setReady] = useState(cached)
  useEffect(() => {
    if (cached !== null) return
    let alive = true
    fetch('/api/docs/send')
      .then((r) => r.json())
      .then((j) => {
        cached = Boolean(j.configured)
        if (alive) setReady(cached)
      })
      .catch(() => alive && setReady(false))
    return () => {
      alive = false
    }
  }, [])
  return ready
}

export async function authHeader(supabase) {
  const { data } = await supabase.auth.getSession()
  return data.session ? { Authorization: `Bearer ${data.session.access_token}` } : {}
}
