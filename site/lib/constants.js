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
  addressLine: '3 impasse du Chasselas',
  postalCode: '49000',
  city: 'Angers',
  fullAddress: '3 impasse du Chasselas, 49000 Angers',
  radiusKm: 30,
  mapEmbedSrc:
    'https://www.google.com/maps?q=3+impasse+du+chasselas+49000+Angers&output=embed',
  googleReviewUrl: 'https://g.page/r/CSFtfbCI8GR-EBE/review',
}

export const HOURS = [
  { day: 'Lundi', hours: '8h30 – 19h00' },
  { day: 'Mardi', hours: '8h30 – 19h00' },
  { day: 'Mercredi', hours: '8h30 – 19h00' },
  { day: 'Jeudi', hours: '8h30 – 19h00' },
  { day: 'Vendredi', hours: '8h30 – 19h00' },
  { day: 'Samedi', hours: '9h00 – 17h00' },
  { day: 'Dimanche', hours: 'Fermé' },
]

// schema.org openingHoursSpecification day codes
export const OPENING_HOURS_SCHEMA = [
  { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '08:30', closes: '19:00' },
  { days: ['Saturday'], opens: '09:00', closes: '17:00' },
]

export const SOCIALS = {
  instagram: 'https://www.instagram.com/la_clean_compagny',
  tiktok: 'https://www.tiktok.com/@la_clean_compagny',
  facebook: 'https://www.facebook.com/lacleancompagny',
  linkedin: 'https://www.linkedin.com/company/la-clean-compagny',
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
