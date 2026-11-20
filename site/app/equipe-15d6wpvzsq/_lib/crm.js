// Logique métier du dashboard La Clean Compagny : statuts, messages types,
// calculs (à faire aujourd'hui, chiffres clés, statistiques). Aucune
// dépendance à l'interface : tout est testable à part.

import { CONTACT } from '@/lib/constants'

// Adresse secrète de l'espace équipe (aussi dans next.config.mjs et les alertes ntfy).
export const BASE_PATH = '/equipe-15d6wpvzsq'

export const STATUSES = [
  { id: 'nouveau', label: 'Nouveau', short: 'Nouveau' },
  { id: 'contacte', label: 'Contacté', short: 'Contacté' },
  { id: 'devis_envoye', label: 'Devis envoyé', short: 'Devis' },
  { id: 'reserve', label: 'Réservé', short: 'Réservé' },
  { id: 'fait', label: 'Prestation faite', short: 'Fait' },
  { id: 'avis_demande', label: 'Avis demandé', short: 'Avis demandé' },
  { id: 'avis_recu', label: 'Avis reçu', short: 'Avis reçu' },
  { id: 'perdu', label: 'Perdu', short: 'Perdu' },
]
export const STATUS_LABEL = Object.fromEntries(STATUSES.map((s) => [s.id, s.label]))

// Colonnes du pipeline (les statuts « après prestation » sont regroupés).
export const PIPELINE = [
  { id: 'nouveau', label: 'Nouveaux', statuses: ['nouveau'] },
  { id: 'contacte', label: 'Contactés', statuses: ['contacte'] },
  { id: 'devis_envoye', label: 'Devis envoyés', statuses: ['devis_envoye'] },
  { id: 'reserve', label: 'Réservés', statuses: ['reserve'] },
  { id: 'fait', label: 'Faits', statuses: ['fait', 'avis_demande', 'avis_recu'] },
  { id: 'perdu', label: 'Perdus', statuses: ['perdu'] },
]

export const CLIENT_STATUSES = ['fait', 'avis_demande', 'avis_recu']
export const OPEN_STATUSES = ['nouveau', 'contacte', 'devis_envoye', 'reserve']

export const SERVICES = [
  'Nettoyage intérieur – Coup de Propre',
  'Nettoyage intérieur – Sortie de Concession',
  'Intérieur + extérieur',
  'Lavage extérieur',
  'Lavage extérieur approfondi',
  'Décontamination',
  'Lustrage minute',
  'Lustrage / polissage',
  'Rénovation des phares',
  'Traitement céramique',
  'Désinfection ozone',
  'Nettoyage moto',
  'Canapé, matelas, tapis',
  'Flotte / professionnel',
  'Autre',
]

export const VEHICLE_SIZES = [
  { id: 'citadine', label: 'Citadine' },
  { id: 'compacte-berline', label: 'Compacte / berline' },
  { id: 'suv-break', label: 'SUV / break' },
  { id: 'grand-suv', label: 'Grand SUV / 7 places' },
  { id: 'utilitaire', label: 'Utilitaire' },
  { id: 'moto', label: 'Moto' },
  { id: 'autre', label: 'Autre' },
]

export const SOURCES = [
  { id: 'accueil-haut', label: 'Site – accueil (haut)' },
  { id: 'accueil-bas', label: 'Site – accueil (bas)' },
  { id: 'devis-en-ligne', label: 'Site – devis en ligne' },
  { id: 'devis-en-ligne-pro', label: 'Site – devis pro' },
  { id: 'telephone', label: 'Appel entrant' },
  { id: 'whatsapp', label: 'WhatsApp / SMS' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'google', label: 'Fiche Google' },
  { id: 'bouche-a-oreille', label: 'Bouche-à-oreille' },
  { id: 'partenaire', label: 'Garage partenaire' },
  { id: 'autre', label: 'Autre' },
]

export function sourceLabel(source) {
  if (!source) return '—'
  const known = SOURCES.find((s) => s.id === source)
  if (known) return known.label
  if (source.startsWith('prestation-')) {
    const slug = source.replace(/^prestation-/, '').replace(/-bas$/, '')
    return `Site – page ${slug.replace(/-/g, ' ')}`
  }
  if (source === 'test') return 'Test'
  return source
}

// Regroupement des sources pour les statistiques.
export function sourceGroup(source) {
  if (!source) return 'Autre'
  if (source.startsWith('accueil') || source.startsWith('prestation-') || source.startsWith('devis')) return 'Site internet'
  return sourceLabel(source)
}

// ---------- Téléphone & liens ----------

export function cleanPhone(phone) {
  return (phone || '').replace(/[^\d+]/g, '')
}

export function intlPhone(phone) {
  const digits = (phone || '').replace(/\D/g, '')
  if (digits.startsWith('33')) return digits
  if (digits.startsWith('0')) return `33${digits.slice(1)}`
  return digits
}

export function formatPhone(phone) {
  const d = (phone || '').replace(/\D/g, '')
  if (d.length === 10) return d.replace(/(\d{2})(?=\d)/g, '$1 ').trim()
  return phone
}

export function telHref(lead) {
  return `tel:${cleanPhone(lead.phone)}`
}

export function whatsappHref(lead, text) {
  return `https://wa.me/${intlPhone(lead.phone)}?text=${encodeURIComponent(text)}`
}

export function smsHref(lead, text) {
  return `sms:${cleanPhone(lead.phone)}?&body=${encodeURIComponent(text)}`
}

export function gmailHref(lead, subject, body) {
  const params = new URLSearchParams({ view: 'cm', fs: '1', to: lead.email || '', su: subject, body })
  return `https://mail.google.com/mail/?${params.toString()}`
}

export function mapsHref(lead) {
  const q = [lead.address, lead.city].filter(Boolean).join(', ')
  return q ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}` : null
}

// ---------- Dates ----------

const DAY = 86400000

export function startOfDay(d = new Date()) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

export function addDays(d, n) {
  return new Date(new Date(d).getTime() + n * DAY)
}

export function daysBetween(a, b) {
  return Math.round((startOfDay(b) - startOfDay(a)) / DAY)
}

export function timeAgo(iso) {
  if (!iso) return ''
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  const rtf = new Intl.RelativeTimeFormat('fr', { numeric: 'auto' })
  if (diff < 60) return "à l'instant"
  if (diff < 3600) return rtf.format(-Math.round(diff / 60), 'minute')
  if (diff < 86400) return rtf.format(-Math.round(diff / 3600), 'hour')
  if (diff < 86400 * 30) return rtf.format(-Math.round(diff / 86400), 'day')
  return rtf.format(-Math.round(diff / (86400 * 30)), 'month')
}

export function formatDate(iso, opts = { dateStyle: 'medium' }) {
  if (!iso) return ''
  return new Date(iso).toLocaleString('fr-FR', opts)
}

export function formatDayLabel(d) {
  const diff = daysBetween(new Date(), d)
  if (diff === 0) return "Aujourd'hui"
  if (diff === 1) return 'Demain'
  if (diff === -1) return 'Hier'
  return new Date(d).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
}

export function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

// <input type="datetime-local"> ⇄ ISO
export function toLocalInput(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function fromLocalInput(value) {
  return value ? new Date(value).toISOString() : null
}

export function toDateInput(iso) {
  return iso ? toLocalInput(iso).slice(0, 10) : ''
}

export function euros(n) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n || 0)
}

// ---------- Messages types ----------

function vehiclePart(lead) {
  return lead.vehicle ? ` votre ${lead.vehicle}` : ' votre véhicule'
}

export function templates(lead) {
  const prenom = lead.first_name || ''
  const sign = '\nEnzo – La Clean Compagny'
  const rdv = lead.appointment_at
    ? `${formatDayLabel(lead.appointment_at).toLowerCase()} à ${formatTime(lead.appointment_at)}`
    : '[date et heure]'
  const prix = lead.quoted_price ? euros(lead.quoted_price) : '[prix]'
  const service = lead.service ? lead.service.toLowerCase() : 'nettoyage'
  return [
    {
      id: 'premier',
      label: 'Premier contact',
      text: `Bonjour ${prenom}, c'est Enzo de La Clean Compagny. Vous avez demandé à être rappelé pour un ${service}${lead.city ? ` à ${lead.city}` : ''}. Quand êtes-vous disponible pour en parler ? Je peux aussi vous faire un prix tout de suite si vous m'envoyez 2-3 photos de${vehiclePart(lead)}.${sign}`,
    },
    {
      id: 'injoignable',
      label: 'Appel manqué',
      text: `Bonjour ${prenom}, j'ai essayé de vous appeler suite à votre demande de nettoyage. Vous pouvez me rappeler au ${CONTACT.phoneDisplay} ou me dire ici quand vous êtes joignable.${sign}`,
    },
    {
      id: 'devis',
      label: 'Envoi du devis',
      text: `Bonjour ${prenom}, comme convenu voici mon prix pour${vehiclePart(lead)} : ${prix} pour ${service}, à domicile, déplacement compris. Dites-moi le jour qui vous arrange et je bloque le créneau.${sign}`,
    },
    {
      id: 'relance-devis',
      label: 'Relance devis',
      text: `Bonjour ${prenom}, je reviens vers vous pour le nettoyage de${vehiclePart(lead)}. Toujours partant ? J'ai encore des créneaux cette semaine.${sign}`,
    },
    {
      id: 'confirmation',
      label: 'Confirmation RDV',
      text: `Bonjour ${prenom}, c'est confirmé pour ${rdv}${lead.address ? ` au ${lead.address}` : ''}. Pensez juste à prévoir un accès à l'électricité. À bientôt !${sign}`,
    },
    {
      id: 'veille',
      label: 'Rappel la veille',
      text: `Bonjour ${prenom}, petit rappel : je passe ${rdv} pour${vehiclePart(lead)}. Si besoin de décaler, dites-le-moi ici.${sign}`,
    },
    {
      id: 'avis',
      label: 'Demande d’avis',
      text: `Bonjour ${prenom}, merci pour votre confiance ! Si le résultat vous a plu, un petit avis Google nous aiderait énormément (30 secondes) : ${CONTACT.googleReviewUrl}${sign}`,
    },
    {
      id: 'relance-avis',
      label: 'Relance avis',
      text: `Bonjour ${prenom}, j'espère que${vehiclePart(lead)} est toujours aussi propre 😄 Si vous avez 30 secondes pour l'avis, voici le lien : ${CONTACT.googleReviewUrl} Merci beaucoup !${sign}`,
    },
    {
      id: 'entretien',
      label: 'Relance entretien',
      text: `Bonjour ${prenom}, ça fait quelques mois depuis le dernier nettoyage de${vehiclePart(lead)}. On le remet au propre ? Je peux passer dans la semaine, dites-moi ce qui vous arrange.${sign}`,
    },
  ]
}

export function emailSubject(lead) {
  return `Votre nettoyage${lead.city ? ` à ${lead.city}` : ''} – La Clean Compagny`
}

// ---------- Calculs ----------

export function lastJob(jobs, leadId) {
  return jobs.filter((j) => j.lead_id === leadId).sort((a, b) => (a.done_at < b.done_at ? 1 : -1))[0] || null
}

// Liste « À faire » : chaque entrée = { lead, reason, tone, sort, template }
export function buildTodo(leads, jobs, now = new Date()) {
  const items = []
  const today = startOfDay(now)
  const tomorrowEnd = addDays(today, 2)
  for (const lead of leads) {
    const age = (now - new Date(lead.created_at)) / 3600000
    if (lead.status === 'nouveau') {
      items.push({
        lead,
        kind: 'rappeler',
        reason: age < 1 ? 'Nouveau : à rappeler maintenant' : `Nouveau depuis ${timeAgo(lead.created_at).replace('il y a ', '')} : à rappeler`,
        tone: age > 24 ? 'danger' : 'urgent',
        sort: 0 + age / 1000,
        template: 'premier',
      })
      continue
    }
    if (lead.next_followup_at && new Date(lead.next_followup_at) <= addDays(today, 1) && lead.status !== 'perdu') {
      items.push({
        lead,
        kind: 'relance',
        reason: `Relance prévue ${formatDayLabel(lead.next_followup_at).toLowerCase()}`,
        tone: new Date(lead.next_followup_at) < today ? 'danger' : 'warn',
        sort: 1,
        template: lead.status === 'devis_envoye' ? 'relance-devis' : 'premier',
      })
      continue
    }
    if (lead.status === 'reserve' && lead.appointment_at) {
      const at = new Date(lead.appointment_at)
      if (at >= today && at < tomorrowEnd) {
        const isToday = daysBetween(now, at) === 0
        items.push({
          lead,
          kind: 'rdv',
          reason: `${isToday ? "RDV aujourd'hui" : 'RDV demain'} à ${formatTime(lead.appointment_at)}${isToday ? '' : ' : envoyer le rappel'}`,
          tone: 'info',
          sort: 2,
          template: isToday ? 'confirmation' : 'veille',
        })
        continue
      }
      if (at < today) {
        items.push({ lead, kind: 'passer-fait', reason: 'RDV passé : marquer la prestation comme faite', tone: 'warn', sort: 3, template: 'avis' })
        continue
      }
    }
    if (lead.status === 'devis_envoye' && !lead.next_followup_at) {
      const since = daysBetween(lead.updated_at, now)
      if (since >= 3) {
        items.push({ lead, kind: 'relance', reason: `Devis sans réponse depuis ${since} jours`, tone: 'warn', sort: 4, template: 'relance-devis' })
        continue
      }
    }
    if (lead.status === 'fait') {
      items.push({ lead, kind: 'avis', reason: 'Prestation faite : demander l’avis Google', tone: 'gold', sort: 5, template: 'avis' })
      continue
    }
    if (lead.status === 'avis_demande' && lead.review_requested_at && daysBetween(lead.review_requested_at, now) >= 3) {
      items.push({ lead, kind: 'avis', reason: `Avis demandé il y a ${daysBetween(lead.review_requested_at, now)} jours : relancer une fois`, tone: 'gold', sort: 6, template: 'relance-avis' })
      continue
    }
    if (CLIENT_STATUSES.includes(lead.status)) {
      const job = lastJob(jobs, lead.id)
      if (job && daysBetween(job.done_at, now) >= 180 && !lead.next_followup_at) {
        items.push({ lead, kind: 'entretien', reason: `Dernier nettoyage il y a ${Math.round(daysBetween(job.done_at, now) / 30)} mois : proposer un entretien`, tone: 'info', sort: 7, template: 'entretien' })
      }
    }
  }
  return items.sort((a, b) => a.sort - b.sort)
}

export function computeKpis(leads, jobs, now = new Date()) {
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const weekAgo = addDays(now, -7)
  const inMonth = (d) => new Date(d) >= monthStart
  const inPrevMonth = (d) => new Date(d) >= prevMonthStart && new Date(d) < monthStart
  const real = leads.filter((l) => l.source !== 'test')
  const caMonth = jobs.filter((j) => inMonth(j.done_at)).reduce((s, j) => s + Number(j.amount || 0), 0)
  const caPrev = jobs.filter((j) => inPrevMonth(j.done_at)).reduce((s, j) => s + Number(j.amount || 0), 0)
  const jobsMonth = jobs.filter((j) => inMonth(j.done_at)).length
  const leads30 = real.filter((l) => new Date(l.created_at) >= addDays(now, -30))
  const won30 = leads30.filter((l) => ['reserve', ...CLIENT_STATUSES].includes(l.status)).length
  const upcoming = real.filter((l) => l.status === 'reserve' && l.appointment_at && new Date(l.appointment_at) >= startOfDay(now))
  return {
    newWeek: real.filter((l) => new Date(l.created_at) >= weekAgo).length,
    toCall: real.filter((l) => l.status === 'nouveau').length,
    upcoming: upcoming.length,
    caMonth,
    caPrev,
    jobsMonth,
    avgTicket: jobsMonth ? caMonth / jobsMonth : 0,
    conversion30: leads30.length ? Math.round((won30 / leads30.length) * 100) : null,
    leads30: leads30.length,
    reviewsAsked: real.filter((l) => l.status === 'avis_demande').length,
    reviewsReceived: real.filter((l) => l.status === 'avis_recu').length,
    pipelineValue: real
      .filter((l) => ['devis_envoye', 'reserve'].includes(l.status))
      .reduce((s, l) => s + Number(l.quoted_price || 0), 0),
  }
}

export function monthlySeries(leads, jobs, months = 6, now = new Date()) {
  const out = []
  for (let i = months - 1; i >= 0; i -= 1) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
    const inRange = (d) => new Date(d) >= start && new Date(d) < end
    out.push({
      label: start.toLocaleDateString('fr-FR', { month: 'short' }),
      leads: leads.filter((l) => l.source !== 'test' && inRange(l.created_at)).length,
      jobs: jobs.filter((j) => inRange(j.done_at)).length,
      ca: jobs.filter((j) => inRange(j.done_at)).reduce((s, j) => s + Number(j.amount || 0), 0),
    })
  }
  return out
}

export function countBy(items, keyFn) {
  const map = new Map()
  for (const it of items) {
    const k = keyFn(it) || 'Non renseigné'
    map.set(k, (map.get(k) || 0) + 1)
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1])
}

export function searchLeads(leads, q) {
  const s = q.trim().toLowerCase()
  if (!s) return leads
  const digits = s.replace(/\D/g, '')
  return leads.filter((l) =>
    [l.first_name, l.city, l.vehicle, l.service, l.email, l.notes, l.address]
      .filter(Boolean)
      .some((v) => v.toLowerCase().includes(s)) || (digits.length >= 3 && (l.phone || '').replace(/\D/g, '').includes(digits))
  )
}

export function toCsv(leads, jobs) {
  const head = ['Prénom', 'Téléphone', 'Email', 'Ville', 'Adresse', 'Véhicule', 'Prestation', 'Statut', 'Prix devis', 'RDV', 'CA total', 'Source', 'Créé le', 'Notes']
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const rows = leads.map((l) => {
    const total = jobs.filter((j) => j.lead_id === l.id).reduce((s, j) => s + Number(j.amount || 0), 0)
    return [l.first_name, l.phone, l.email, l.city, l.address, l.vehicle, l.service, STATUS_LABEL[l.status], l.quoted_price, l.appointment_at ? formatDate(l.appointment_at, { dateStyle: 'short', timeStyle: 'short' }) : '', total || '', sourceLabel(l.source), formatDate(l.created_at, { dateStyle: 'short' }), l.notes]
      .map(esc)
      .join(';')
  })
  return '﻿' + [head.map(esc).join(';'), ...rows].join('\n')
}

// ---------- Devis et factures ----------
export const DOC_STATUS = {
  brouillon: 'Brouillon',
  envoye: 'Envoyé',
  accepte: 'Accepté',
  refuse: 'Refusé',
  paye: 'Payée',
  annule: 'Annulé',
}

export function lineTotal(l) {
  return Math.round((Number(l.qty) || 0) * (Number(l.unit_price) || 0) * 100) / 100
}

export function docTotal(lines) {
  return Math.round((lines || []).reduce((s, l) => s + lineTotal(l), 0) * 100) / 100
}

export function euros2(n) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(Number(n) || 0)
}

export function clientFromLead(lead) {
  if (!lead) return {}
  return {
    name: lead.first_name || '',
    phone: lead.phone || '',
    email: lead.email || '',
    address: [lead.address, lead.city].filter(Boolean).join(', '),
    vehicle: lead.vehicle || '',
  }
}

export function isOverdue(doc, now = new Date()) {
  if (doc.kind !== 'facture' || doc.status !== 'envoye') return false
  const due = doc.due_at ? new Date(doc.due_at) : addDays(new Date(doc.issued_at), 30)
  return due < startOfDay(now)
}

// ---------- Planning ----------
export function startOfWeek(d = new Date()) {
  const x = startOfDay(d)
  const day = (x.getDay() + 6) % 7 // lundi = 0
  return addDays(x, -day)
}

export function sameDay(a, b) {
  const x = new Date(a)
  const y = new Date(b)
  return x.getFullYear() === y.getFullYear() && x.getMonth() === y.getMonth() && x.getDate() === y.getDate()
}

function gcalStamp(d) {
  return new Date(d).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

// Lien « Ajouter à Google Agenda » pré-rempli pour un RDV.
export function gcalHref(lead, durationH = 3) {
  if (!lead.appointment_at) return null
  const start = new Date(lead.appointment_at)
  const end = new Date(start.getTime() + durationH * 3600000)
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `🧽 ${lead.first_name} – ${lead.service || 'Nettoyage'}`,
    dates: `${gcalStamp(start)}/${gcalStamp(end)}`,
    details: [lead.phone && `Tél : ${formatPhone(lead.phone)}`, lead.vehicle && `Véhicule : ${lead.vehicle}`, lead.notes]
      .filter(Boolean)
      .join('\n'),
    location: [lead.address, lead.city].filter(Boolean).join(', '),
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

// ---------- Statistiques relevées (fiche Google, Search Console) ----------
export function statSeries(stats, source, metric, days = 30, now = new Date()) {
  const map = new Map(stats.filter((s) => s.source === source && s.metric === metric).map((s) => [s.day, Number(s.value)]))
  const out = []
  for (let i = days - 1; i >= 0; i--) {
    const d = addDays(startOfDay(now), -i)
    const key = toDateInput(d.toISOString())
    out.push({ day: key, value: map.has(key) ? map.get(key) : null })
  }
  return out
}

export function latestStat(stats, source, metric) {
  const rows = stats.filter((s) => s.source === source && s.metric === metric).sort((a, b) => (a.day < b.day ? 1 : -1))
  return rows[0] ? { value: Number(rows[0].value), day: rows[0].day, prev: rows[1] ? Number(rows[1].value) : null } : null
}

export function sumStat(stats, source, metric, fromDay) {
  return stats
    .filter((s) => s.source === source && s.metric === metric && s.day >= fromDay)
    .reduce((t, s) => t + Number(s.value), 0)
}
