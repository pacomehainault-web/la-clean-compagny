// Utilisée dans les titres d'articles qui citent une année (ex. « Combien
// coûte... en 2026 ? ») — un seul endroit à mettre à jour chaque janvier.
export const CURRENT_YEAR = 2026

export const SITE = {
  name: 'La Clean Compagny',
  legalName: 'La Clean Compagny',
  slogan: 'Chaque véhicule, même exigence',
  foundedYear: 2023,
  // Source UNIQUE du domaine : lue ici par absoluteUrl()/buildMetadata() (canonical,
  // OG, Twitter), par robots.js et sitemap.js. Ne jamais coder un domaine en dur
  // ailleurs dans le projet — passer par SITE.url ou absoluteUrl().
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.lacleancompagny.com',
  siren: '953 772 282 00018',
  gerant: 'Enzo Soldet',
  vatNote: 'TVA non applicable, art. 293 B du CGI',
}

export const CONTACT = {
  phoneDisplay: '06 38 57 83 04',
  phoneTel: '+33638578304',
  phoneWhatsapp: '33638578304',
  email: 'lacleancompagny49@gmail.com',
  // Pas d'adresse postale publiée : l'entreprise se déplace exclusivement chez
  // le client, on communique uniquement la zone d'intervention (ville + rayon).
  city: 'Angers',
  radiusKm: 30,
  // Identifiant Google Maps réel de la fiche Google Business de La Clean
  // Compagny, résolu à partir de googleReviewUrl ci-dessous (ce lien court
  // redirige vers .../writereview?placeid=ChIJx9Gdg9C2eiERIW19sIjwZH4 — c'est
  // Google lui-même qui associe ce Place ID à la fiche de l'entreprise, pas
  // une valeur choisie ici). Utilisé à la fois pour la carte intégrée et pour
  // le lien canonique de la fiche dans le JSON-LD (lib/schema.js → sameAs).
  googlePlaceId: 'ChIJx9Gdg9C2eiERIW19sIjwZH4',
  // Carte de la fiche réelle (plus la carte générique de la ville d'Angers).
  mapEmbedSrc: 'https://www.google.com/maps?q=place_id:ChIJx9Gdg9C2eiERIW19sIjwZH4&output=embed',
  googleReviewUrl: 'https://g.page/r/CSFtfbCI8GR-EBE/review',
  // Lien canonique de la fiche Google Business, construit à partir du même
  // Place ID — c'est ce que lib/schema.js ajoute à `sameAs`.
  googleBusinessUrl: 'https://www.google.com/maps/place/?q=place_id:ChIJx9Gdg9C2eiERIW19sIjwZH4',
}

export const SOCIALS = {
  instagram: 'https://www.instagram.com/la_clean_compagny/',
  tiktok: 'https://www.tiktok.com/@lacleancompagny?_r=1&_t=ZN-98Wc8hA3yWh',
  facebook: 'https://www.facebook.com/share/198SXjCbm3/?mibextid=wwXIfr',
  linkedin: 'https://www.linkedin.com/in/enzo-soldet-76a17329a',
}

export function whatsappLink(message) {
  const base = `https://wa.me/${CONTACT.phoneWhatsapp}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}

export function mailtoLink({ subject, body }) {
  const params = new URLSearchParams()
  if (subject) params.set('subject', subject)
  if (body) params.set('body', body)
  const qs = params.toString()
  return `mailto:${CONTACT.email}${qs ? `?${qs}` : ''}`
}

export function telLink() {
  return `tel:${CONTACT.phoneTel}`
}
