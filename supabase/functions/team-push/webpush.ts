// Web Push minimal (RFC 8030 / 8291 / 8292) — uniquement Web Crypto, compatible Deno et Node.
const enc = new TextEncoder()

export function b64urlToBytes(s: string): Uint8Array {
  const pad = '='.repeat((4 - (s.length % 4)) % 4)
  const b = atob((s + pad).replace(/-/g, '+').replace(/_/g, '/'))
  const out = new Uint8Array(b.length)
  for (let i = 0; i < b.length; i++) out[i] = b.charCodeAt(i)
  return out
}

export function bytesToB64url(bytes: Uint8Array): string {
  let s = ''
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i])
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function concat(...parts: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0))
  let o = 0
  for (const p of parts) {
    out.set(p, o)
    o += p.length
  }
  return out
}

async function hkdf(salt: Uint8Array, ikm: Uint8Array, info: Uint8Array, length: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt, info }, key, length * 8)
  return new Uint8Array(bits)
}

// Chiffrement aes128gcm du message pour un abonnement (clé p256dh + secret auth du téléphone).
export async function encryptPayload(payload: Uint8Array, p256dh: string, auth: string, salt?: Uint8Array) {
  const uaPublic = b64urlToBytes(p256dh)
  const authSecret = b64urlToBytes(auth)
  const asKeys = (await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits'])) as CryptoKeyPair
  const asPublic = new Uint8Array(await crypto.subtle.exportKey('raw', asKeys.publicKey))
  const uaKey = await crypto.subtle.importKey('raw', uaPublic, { name: 'ECDH', namedCurve: 'P-256' }, false, [])
  const ecdhSecret = new Uint8Array(await crypto.subtle.deriveBits({ name: 'ECDH', public: uaKey }, asKeys.privateKey, 256))

  const keyInfo = concat(enc.encode('WebPush: info\0'), uaPublic, asPublic)
  const ikm = await hkdf(authSecret, ecdhSecret, keyInfo, 32)
  const s = salt || crypto.getRandomValues(new Uint8Array(16))
  const cek = await hkdf(s, ikm, enc.encode('Content-Encoding: aes128gcm\0'), 16)
  const nonce = await hkdf(s, ikm, enc.encode('Content-Encoding: nonce\0'), 12)

  const plain = concat(payload, new Uint8Array([2]))
  const aesKey = await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, ['encrypt'])
  const cipher = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, aesKey, plain))

  const rs = new Uint8Array(4)
  new DataView(rs.buffer).setUint32(0, 4096)
  return concat(s, rs, new Uint8Array([asPublic.length]), asPublic, cipher)
}

// En-tête VAPID signé ES256 (JWT) pour l'origine du service de push.
export async function vapidAuthorization(endpoint: string, vapidPrivateJwk: JsonWebKey, vapidPublic: string, subject: string) {
  const aud = new URL(endpoint).origin
  const header = bytesToB64url(enc.encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' })))
  const claims = bytesToB64url(enc.encode(JSON.stringify({ aud, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: subject })))
  const key = await crypto.subtle.importKey('jwk', vapidPrivateJwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign'])
  const sig = new Uint8Array(await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, enc.encode(`${header}.${claims}`)))
  return `vapid t=${header}.${claims}.${bytesToB64url(sig)}, k=${vapidPublic}`
}

export type Subscription = { endpoint: string; p256dh: string; auth: string }

export async function sendPush(sub: Subscription, message: unknown, opts: { jwk: JsonWebKey; publicKey: string; subject: string; ttl?: number; urgency?: string; topic?: string }) {
  const body = await encryptPayload(enc.encode(JSON.stringify(message)), sub.p256dh, sub.auth)
  const headers: Record<string, string> = {
    Authorization: await vapidAuthorization(sub.endpoint, opts.jwk, opts.publicKey, opts.subject),
    'Content-Encoding': 'aes128gcm',
    'Content-Type': 'application/octet-stream',
    TTL: String(opts.ttl ?? 86400),
    Urgency: opts.urgency || 'high',
  }
  if (opts.topic) headers.Topic = opts.topic
  const res = await fetch(sub.endpoint, { method: 'POST', headers, body })
  const text = res.ok ? '' : (await res.text()).slice(0, 300)
  return { status: res.status, text }
}
