export const SITE = {
  name: 'La Clean Compagny',
  legalName: 'La Clean Compagny',
  slogan: 'Chaque véhicule, même exigence',
  foundedYear: 2023,
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.lacleancompagny.fr',
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
  mapEmbedSrc: 'https://www.google.com/maps?q=Angers&output=embed',
  googleReviewUrl: 'https://g.page/r/CSFtfbCI8GR-EBE/review',
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
