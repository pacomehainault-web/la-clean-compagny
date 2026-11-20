// Notifications push natives de l'espace équipe (Web Push).
// Le téléphone s'abonne ici ; la base envoie ensuite les alertes via la fonction Supabase « team-push ».

import { BASE_PATH } from './crm'

// Clé publique VAPID (publique par nature ; la clé privée reste côté serveur).
export const VAPID_PUBLIC_KEY = 'BOqx5E7Guk9fCLPwtUgN8CvI9LzZkz-I2vLKjZXbe4THiR-syDMaEcYVbZUwXOzX-JHPVJa_e0bnX_QZ52zNuKM'
const SW_URL = `${BASE_PATH}/sw.js`

function urlB64ToUint8Array(s) {
  const pad = '='.repeat((4 - (s.length % 4)) % 4)
  const raw = atob((s + pad).replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from(raw, (c) => c.charCodeAt(0))
}

export function isIos() {
  if (typeof navigator === 'undefined') return false
  return /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

export function isStandalone() {
  if (typeof window === 'undefined') return false
  return window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true
}

// État de l'appareil : 'ios-browser' (iPhone hors écran d'accueil), 'unsupported', 'denied', 'ready', 'on'.
export async function pushState() {
  if (typeof window === 'undefined') return 'unsupported'
  const capable = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
  if (isIos() && !isStandalone()) return 'ios-browser'
  if (!capable) return 'unsupported'
  if (Notification.permission === 'denied') return 'denied'
  const reg = await navigator.serviceWorker.getRegistration(SW_URL)
  const sub = reg ? await reg.pushManager.getSubscription() : null
  return sub && Notification.permission === 'granted' ? 'on' : 'ready'
}

function deviceLabel() {
  const ua = navigator.userAgent
  if (/iPhone/.test(ua)) return 'iPhone'
  if (/iPad/.test(ua) || isIos()) return 'iPad'
  if (/Android/.test(ua)) return 'Android'
  if (/Mac/.test(ua)) return 'Mac'
  if (/Windows/.test(ua)) return 'PC'
  return 'Appareil'
}

async function register() {
  const reg = await navigator.serviceWorker.register(SW_URL, { scope: BASE_PATH })
  await navigator.serviceWorker.ready
  return reg
}

async function save(supabase, sub) {
  const json = sub.toJSON()
  const { error } = await supabase
    .from('push_subscriptions')
    .upsert({ endpoint: json.endpoint, p256dh: json.keys.p256dh, auth: json.keys.auth, device: deviceLabel() }, { onConflict: 'endpoint' })
  if (error) throw error
}

// À appeler depuis un clic (obligatoire sur iPhone pour la demande d'autorisation).
export async function enablePush(supabase) {
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return permission === 'denied' ? 'denied' : 'ready'
  const reg = await register()
  let sub = await reg.pushManager.getSubscription()
  if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlB64ToUint8Array(VAPID_PUBLIC_KEY) })
  await save(supabase, sub)
  return 'on'
}

export async function disablePush(supabase) {
  const reg = await navigator.serviceWorker.getRegistration(SW_URL)
  const sub = reg ? await reg.pushManager.getSubscription() : null
  if (sub) {
    await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
    await sub.unsubscribe()
  }
  return 'ready'
}

// Au chargement : si l'appareil est déjà abonné, on ré-enregistre l'abonnement (au cas où il aurait changé).
export async function syncPush(supabase) {
  try {
    if (!('serviceWorker' in navigator) || !('Notification' in window) || Notification.permission !== 'granted') return
    const reg = await register()
    const sub = await reg.pushManager.getSubscription()
    if (sub) await save(supabase, sub)
  } catch {
    // silencieux : l'écran Réglages affiche l'état exact
  }
}
