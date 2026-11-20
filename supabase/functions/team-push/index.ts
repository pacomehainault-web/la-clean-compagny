// Envoi des notifications push natives de l'espace équipe La Clean Compagny.
// Appelée uniquement par la base (pg_net) avec le secret partagé stocké dans private.push_config.
import postgres from 'npm:postgres@3.4.5'
import { sendPush } from './webpush.ts'

const sql = postgres(Deno.env.get('SUPABASE_DB_URL')!, { prepare: false, max: 2 })

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })
  const [cfg] = await sql`select vapid_public, vapid_jwk, secret, subject from private.push_config where id = 1`
  if (!cfg || req.headers.get('x-push-secret') !== cfg.secret) return new Response('Forbidden', { status: 403 })

  const msg = await req.json().catch(() => ({}))
  const payload = {
    title: String(msg.title || 'La Clean Compagny').slice(0, 120),
    body: String(msg.body || '').slice(0, 600),
    url: typeof msg.url === 'string' && msg.url.startsWith('/') ? msg.url : '/equipe-15d6wpvzsq',
    tag: msg.tag || undefined,
  }
  const delay = Math.min(Math.max(Number(msg.delay) || 0, 0), 30)
  if (delay > 0) {
    // Test différé : on répond tout de suite et on envoie après le délai.
    // @ts-ignore EdgeRuntime est fourni par Supabase
    EdgeRuntime.waitUntil(new Promise((r) => setTimeout(r, delay * 1000)).then(() => deliver(cfg, payload)))
    return Response.json({ scheduled: delay })
  }
  const results = await deliver(cfg, payload)
  return Response.json({ sent: results.length, statuses: results })
})

async function deliver(cfg: any, payload: Record<string, unknown>) {
  const subs = await sql`select id, endpoint, p256dh, auth from public.push_subscriptions`
  return await Promise.all(
    subs.map(async (s: any) => {
      try {
        const r = await sendPush(s, payload, { jwk: cfg.vapid_jwk, publicKey: cfg.vapid_public, subject: cfg.subject })
        if (r.status === 404 || r.status === 410) {
          await sql`delete from public.push_subscriptions where id = ${s.id}`
        } else {
          await sql`update public.push_subscriptions set last_status = ${r.status}, last_error = ${r.text || null}, last_sent_at = now() where id = ${s.id}`
        }
        return r.status
      } catch (e) {
        await sql`update public.push_subscriptions set last_status = 0, last_error = ${String(e).slice(0, 300)}, last_sent_at = now() where id = ${s.id}`
        return 0
      }
    }),
  )
}
