'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { LEADS_DB } from '@/lib/constants'

// Compteur de visites anonyme pour le dashboard : une ligne par jour, page et
// provenance (Google, accès direct, réseaux sociaux, autres sites). Aucun
// cookie, aucun identifiant, aucune adresse IP enregistrée : seulement des totaux.
function refCategory() {
  const ref = document.referrer
  if (!ref) return 'direct'
  try {
    const host = new URL(ref).hostname
    if (host.endsWith('lacleancompagny.com')) return null // navigation interne : déjà comptée
    if (/(^|\.)google\./.test(host)) return 'google'
    if (/facebook|instagram|tiktok|linkedin|snapchat|pinterest|youtube|t\.co$|x\.com/.test(host)) return 'social'
    return 'autre'
  } catch {
    return 'autre'
  }
}

export default function ViewTracker() {
  const pathname = usePathname()
  useEffect(() => {
    if (!pathname || process.env.NODE_ENV !== 'production') return
    if (!/^\/[a-z0-9/_-]*$/.test(pathname) || pathname.length > 120) return
    let ref = 'interne'
    try {
      // Provenance mesurée sur la première page de la visite seulement.
      if (!window.sessionStorage.getItem('lcc-v')) {
        ref = refCategory() || 'autre'
        window.sessionStorage.setItem('lcc-v', '1')
      }
    } catch {
      ref = 'autre'
    }
    fetch(`${LEADS_DB.url}/rest/v1/rpc/track_view`, {
      method: 'POST',
      headers: { apikey: LEADS_DB.publishableKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_path: pathname, p_ref: ref }),
      keepalive: true,
    }).catch(() => {})
  }, [pathname])
  return null
}
