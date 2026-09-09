// Limitation de débit par IP pour les routes API publiques (contact, devis).
//
// ⚠️ Stockage en mémoire du process Node : fiable en dev et sur un serveur à
// instance unique, mais PAS garanti sur des fonctions serverless
// multi-instances (Vercel) — chaque invocation peut atterrir sur une instance
// différente avec sa propre mémoire, donc un attaquant distribué sur plusieurs
// invocations peut contourner la limite. C'est une protection en profondeur
// contre le spam basique, pas une garantie absolue : pour une limite fiable en
// production serverless, un store partagé (Vercel KV, Upstash Redis…) est
// nécessaire — voir le rapport de sécurité livré avec cet audit.
const WINDOW_MS = 15 * 60 * 1000 // 15 minutes
const MAX_REQUESTS = 5 // par IP, par fenêtre

const hits = new Map()

function recentTimestamps(ip, windowMs, now) {
  return (hits.get(ip) || []).filter((t) => now - t < windowMs)
}

// Renvoie true si l'IP a dépassé son quota (la requête doit être rejetée).
export function isRateLimited(ip, { windowMs = WINDOW_MS, max = MAX_REQUESTS } = {}) {
  const now = Date.now()
  const timestamps = recentTimestamps(ip, windowMs, now)

  if (timestamps.length >= max) {
    hits.set(ip, timestamps)
    return true
  }

  timestamps.push(now)
  hits.set(ip, timestamps)

  // Purge occasionnelle pour éviter que la Map ne grossisse indéfiniment sur
  // un process longue durée (une IP sur mille suffit statistiquement).
  if (Math.random() < 0.01) {
    for (const [key, values] of hits) {
      if (recentTimestamps(key, windowMs, now).length === 0) hits.delete(key)
    }
  }

  return false
}

// Meilleur effort : x-forwarded-for est déclaré par le proxy amont (Vercel le
// fait fidèlement), mais reste un header client falsifiable en environnement
// non-proxifié — acceptable pour une limite anti-spam, pas pour de l'auth.
export function getClientIp(request) {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return request.headers.get('x-real-ip') || 'unknown'
}
