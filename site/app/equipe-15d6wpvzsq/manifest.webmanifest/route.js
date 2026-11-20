// Manifest de l'app « La Clean » installée sur l'écran d'accueil (nécessaire pour les notifications sur iPhone).

const BASE = '/equipe-15d6wpvzsq'

const MANIFEST = {
  id: BASE,
  name: 'La Clean – Espace équipe',
  short_name: 'La Clean',
  description: 'Prospects, planning, devis et alertes de La Clean Compagny.',
  start_url: BASE,
  scope: BASE,
  display: 'standalone',
  orientation: 'portrait',
  background_color: '#0F1B33',
  theme_color: '#0F1B33',
  lang: 'fr',
  icons: [
    { src: '/images/app/equipe-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: '/images/app/equipe-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: '/images/app/equipe-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
}

export function GET() {
  return Response.json(MANIFEST, {
    headers: { 'Content-Type': 'application/manifest+json; charset=utf-8' },
  })
}
