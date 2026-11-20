// Service worker de l'espace équipe : reçoit les notifications push et ouvre l'espace au toucher.
// Servi depuis l'adresse secrète pour ne rien exposer sur le site public.

const BASE = '/equipe-15d6wpvzsq'

const SCRIPT = `
const BASE = ${JSON.stringify(BASE)};

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) { data = { body: event.data ? event.data.text() : '' }; }
  const title = data.title || 'La Clean Compagny';
  const options = {
    body: data.body || '',
    icon: '/images/app/equipe-192.png',
    badge: '/images/app/equipe-badge-96.png',
    data: { url: data.url && data.url.startsWith('/') ? data.url : BASE },
  };
  if (data.tag) { options.tag = data.tag; options.renotify = true; }
  event.waitUntil(Promise.all([
    self.registration.showNotification(title, options),
    self.navigator && self.navigator.setAppBadge ? self.navigator.setAppBadge().catch(() => {}) : null,
  ]));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = new URL((event.notification.data && event.notification.data.url) || BASE, self.location.origin).href;
  event.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of all) {
      if (client.url.includes(BASE) && 'focus' in client) {
        await client.focus();
        if ('navigate' in client && client.url !== url) { try { await client.navigate(url); } catch (e) {} }
        return;
      }
    }
    await self.clients.openWindow(url);
  })());
});
`

export function GET() {
  return new Response(SCRIPT, {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Service-Worker-Allowed': BASE,
    },
  })
}
