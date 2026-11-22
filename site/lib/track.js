// Mesure des conversions : Google Analytics (gtag) et pixel Meta (fbq).
// Les deux scripts ne sont chargés qu'après acceptation des cookies : sans
// accord, ces fonctions ne font rien.

function gtag(...args) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') window.gtag(...args)
}

function fbq(...args) {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') window.fbq(...args)
}

// Formulaire « être rappelé » / devis envoyé.
export function trackLead(source) {
  gtag('event', 'generate_lead', { form_source: source })
  fbq('track', 'Lead', { content_name: source })
}

// Réservation en ligne confirmée.
export function trackBooking({ service, price } = {}) {
  gtag('event', 'generate_lead', { form_source: 'reservation-en-ligne' })
  gtag('event', 'book_appointment', { service, value: price || undefined, currency: 'EUR' })
  fbq('track', 'Schedule', { content_name: service, value: price || undefined, currency: 'EUR' })
}

// Clic sur un numéro de téléphone ou sur WhatsApp.
export function trackContact(kind) {
  gtag('event', kind === 'whatsapp' ? 'click_whatsapp' : 'click_call')
  fbq('track', 'Contact', { content_name: kind })
}
