const isDev = process.env.NODE_ENV === 'development'

// CSP "sans nonce" (voir node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md,
// section "Without Nonces") : plus simple qu'une CSP à base de nonce, et
// surtout compatible avec le rendu statique/ISR de tout le site. L'alternative
// à base de nonce (script-src strict, zéro 'unsafe-inline') existe mais oblige
// à rendre CHAQUE page dynamiquement (voir doc, section "Static vs Dynamic
// Rendering with CSP") — perte du prerendering statique pour un site qui est
// à 95 % des pages marketing statiques. Compromis assumé, à raffiner plus tard
// si un jour une CSP zéro-unsafe-inline devient une exigence stricte.
//
// - 'unsafe-inline' sur script-src : nécessaire pour le script inline de
//   Google Analytics (components/Analytics.js, <Script id="ga-init">) et pour
//   le JSON-LD (components/JsonLd.js, seule utilisation de
//   dangerouslySetInnerHTML du site — toujours des données schema.org
//   statiques, jamais de saisie utilisateur).
// - 'unsafe-inline' sur style-src : nécessaire pour les styles inline générés
//   par Framer Motion et les quelques style={{...}} du code. Risque bien
//   moindre que sur script-src : du CSS ne peut pas exécuter de JavaScript.
// - blob: sur img-src : aperçus locaux des photos avant upload
//   (URL.createObjectURL dans QuoteWizard.js).
// - connect-src : Cloudinary (upload direct navigateur → Cloudinary),
//   EmailJS (envoi direct navigateur → EmailJS), Google Analytics (mesure
//   d'audience, chargé seulement après consentement cookies).
// - frame-src : uniquement Google Maps (composants/GoogleMapEmbed.js).
const cspDirectives = [
  `default-src 'self'`,
  // 'wasm-unsafe-eval' : lecture des plaques dans l'espace équipe (moteur tesseract.js en
  // WebAssembly, servi depuis /ocr). N'autorise que la compilation de WebAssembly, pas eval().
  `script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' https://www.googletagmanager.com${isDev ? " 'unsafe-eval'" : ''}`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data: blob: https://ibeejsvztajwploqmnkh.supabase.co`,
  `font-src 'self'`,
  `connect-src 'self' https://ibeejsvztajwploqmnkh.supabase.co https://api.open-meteo.com https://data.geopf.fr https://nominatim.openstreetmap.org https://api.cloudinary.com https://api.emailjs.com https://www.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com`,
  `frame-src https://www.google.com`,
  `object-src 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `frame-ancestors 'none'`,
  // Absent en dev : force sinon la réécriture de CHAQUE requête http://localhost
  // en https://, qui échoue puisque le serveur de dev ne parle pas TLS (testé :
  // casse le chargement de toutes les ressources sous Safari/WebKit). Sans
  // effet en production, où Vercel sert déjà tout en HTTPS par défaut.
  ...(isDev ? [] : [`upgrade-insecure-requests`]),
]
const contentSecurityPolicy = cspDirectives.join('; ')

const securityHeaders = [
  // Filet de sécurité redondant avec `frame-ancestors 'none'` ci-dessus : les
  // navigateurs qui ignorent encore frame-ancestors respectent X-Frame-Options.
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(self), geolocation=()' },
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  // 2 ans, sous-domaines inclus, éligible à la liste de préchargement HSTS des
  // navigateurs — n'a d'effet qu'une fois le site servi en HTTPS (Vercel le
  // fait par défaut), inoffensif en dev où le navigateur ignore HSTS sur localhost.
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // 75 = qualité par défaut de next/image ; 85 = utilisée pour l'image du
    // Hero (photo pleine largeur, mérite un peu plus de netteté).
    qualities: [75, 85],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      {
        // Pages de suivi client (lien secret) : jamais indexées ni mises en cache partagé.
        source: '/suivi/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
          { key: 'Cache-Control', value: 'private, no-store' },
          { key: 'Referrer-Policy', value: 'no-referrer' },
        ],
      },
      {
        // Espace équipe : jamais indexé ni mis en cache partagé.
        source: '/equipe-15d6wpvzsq/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
          { key: 'Cache-Control', value: 'private, no-store' },
        ],
      },
    ]
  },
  // Le site est servi sur www.lacleancompagny.com. Historiquement, tout le SEO
  // technique pointait vers .fr (jamais servi), ce qui empêchait Google
  // d'indexer la bonne version. Ces redirections 301 n'ont d'effet QUE si les
  // domaines lacleancompagny.fr et lacleancompagny.com (sans www) sont
  // effectivement rattachés à ce projet Vercel (Project Settings → Domains) —
  // sinon les requêtes n'atteignent jamais ce code. Voir la checklist des
  // actions manuelles.
  async redirects() {
    const toWww = (host) => ({
      source: '/:path*',
      has: [{ type: 'host', value: host }],
      destination: 'https://www.lacleancompagny.com/:path*',
      permanent: true,
    })
    // Restructuration SEO de la zone d'intervention (novembre 2026) :
    // - /zone-intervention/angers faisait concurrence à la page d'accueil sur
    //   « nettoyage voiture Angers » : son contenu a été fusionné dans l'accueil.
    // - Les petites communes (`grouped: true` dans lib/data/cities.js) sont
    //   regroupées sur une seule page, plus solide que quatre pages minces.
    //   ⚠️ Liste à garder alignée avec les communes `grouped: true` de
    //   lib/data/cities.js (non importé ici : next.config.mjs est chargé par
    //   Node en dehors du bundler, et lib/ est en syntaxe ESM sans "type": "module").
    const groupedCommunes = ['murs-erigne', 'montreuil-juigne', 'ecouflant', 'sainte-gemmes-sur-loire'].map(
      (slug) => ({
        source: `/zone-intervention/${slug}`,
        destination: '/zone-intervention/communes-voisines',
        permanent: true,
      })
    )
    return [
      toWww('lacleancompagny.fr'),
      toWww('www.lacleancompagny.fr'),
      toWww('lacleancompagny.com'),
      // Adresse Vercel de production : sinon Google voit un doublon complet du site.
      // (Les aperçus de branches « la-clean-compagny-git-… » ne sont pas concernés.)
      // L'espace équipe, l'API, le suivi client et le service worker restent servis tels quels
      // (une appli installée depuis cette adresse continue de fonctionner).
      { source: '/', has: [{ type: 'host', value: 'la-clean-compagny.vercel.app' }], destination: 'https://www.lacleancompagny.com/', permanent: true },
      {
        source: '/:path((?!equipe-15d6wpvzsq|api|suivi|p/|_next).*)',
        has: [{ type: 'host', value: 'la-clean-compagny.vercel.app' }],
        destination: 'https://www.lacleancompagny.com/:path',
        permanent: true,
      },
      { source: '/zone-intervention/angers', destination: '/', permanent: true },
      ...groupedCommunes,
    ]
  },
};

export default nextConfig;
