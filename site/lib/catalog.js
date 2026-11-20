// Catalogue des prestations (prix = tarifs du site), partagé entre l'espace
// équipe et la réservation en ligne. Aucune donnée privée ici : ce fichier
// part dans le code public du site.

import {
  FORMULAS_PRICING,
  EXTERIOR_PRICING,
  CORRECTION_PRICING,
  LUSTRAGE_MINUTE_HIGHLIGHT,
  MOTO_PRICING,
  OPTICS_PRICING,
} from '@/lib/data/pricing'

export const WORK_START = 8
export const WORK_END = 19

// Gabarits (id = valeur de leads.vehicle_size).
export const QUICK_SIZES = [
  { id: 'citadine', label: 'Citadine' },
  { id: 'compacte-berline', label: 'Berline' },
  { id: 'suv-break', label: 'SUV / break' },
  { id: 'grand-suv', label: 'Grand SUV' },
  { id: 'utilitaire', label: 'Utilitaire' },
  { id: 'moto', label: 'Moto' },
]

const priceKey = (size) => (size === 'utilitaire' ? 'grand-suv' : size)

// minutes = durée habituelle sur place ; online = réservable en ligne.
export const CATALOG = [
  ...FORMULAS_PRICING.map((f) => ({
    label: `Nettoyage intérieur – ${f.name}`,
    short: f.name,
    prices: f.prices,
    minutes: f.id === 'sortie-concession' ? 240 : 150,
    online: true,
  })),
  ...EXTERIOR_PRICING.map((f) => ({
    label: f.name,
    short: { 'lavage-exterieur': 'Lavage ext.', 'lavage-exterieur-approfondi': 'Ext. approfondi', 'decontamination-complete': 'Décontamination' }[f.id] || f.name,
    prices: f.prices,
    minutes: f.id === 'lavage-exterieur' ? 60 : 120,
    online: true,
  })),
  { label: 'Lustrage minute', short: 'Lustrage minute', from: LUSTRAGE_MINUTE_HIGHLIGHT.fromPrice, minutes: 60, online: true },
  ...CORRECTION_PRICING.map((f) => ({
    label: f.name,
    short: f.name,
    prices: f.prices,
    minutes: f.id === 'lustrage-express' ? 180 : f.id === 'lustrage-finition' ? 300 : 420,
    online: true,
  })),
  { label: 'Rénovation des phares', short: 'Phares', from: OPTICS_PRICING.fromPrice, minutes: 60, online: true },
  { label: 'Nettoyage moto', short: 'Moto', from: MOTO_PRICING.fromPrice, minutes: 90, online: true },
  { label: 'Canapé, matelas, tapis', short: 'Canapé / tissus', minutes: 150, online: false },
  { label: 'Flotte / professionnel', short: 'Pro / flotte', minutes: 240, online: false },
]

export function catalogItem(service) {
  if (!service) return null
  const s = service.toLowerCase()
  return CATALOG.find((c) => c.label.toLowerCase() === s) || CATALOG.find((c) => s.includes(c.short.toLowerCase())) || null
}

// Prix du site pour une prestation et un gabarit (null si sur devis).
export function priceFor(service, size) {
  const item = catalogItem(service)
  if (!item) return null
  if (item.prices && size && item.prices[priceKey(size)]) return item.prices[priceKey(size)]
  return item.from || null
}

export function defaultMinutes(service) {
  const item = catalogItem(service)
  if (item) return item.minutes
  const s = (service || '').toLowerCase()
  if (/compl|concession|lustrage|polissage|céramique|ceramique/.test(s)) return 240
  if (/ext/.test(s)) return 90
  return 150
}

// Famille de prestation : sert aux checklists, aux relances, à la météo et au stock.
export function serviceFamily(service) {
  const s = (service || '').toLowerCase()
  if (/canap|matelas|tapis|tissu/.test(s)) return 'canape'
  if (/phare|optique/.test(s)) return 'phares'
  if (/moto/.test(s)) return 'moto'
  if (/c[ée]ramique/.test(s)) return 'ceramique'
  if (/lustrage|polissage|correction/.test(s)) return 'lustrage'
  if (/int[ée]rieur \+ ext|complet/.test(s)) return 'complet'
  if (/int[ée]rieur|propre|concession|ozone/.test(s)) return 'interieur'
  if (/ext|lavage|d[ée]contamination/.test(s)) return 'exterieur'
  return 'autre'
}

// Les prestations qui se font dehors et craignent la pluie.
export function isOutdoor(service) {
  return ['exterieur', 'lustrage', 'ceramique', 'moto', 'complet', 'phares'].includes(serviceFamily(service))
}

// Délai conseillé avant de reproposer la même prestation (jours).
export const RECALL_DAYS = {
  interieur: 90,
  exterieur: 30,
  complet: 60,
  lustrage: 180,
  ceramique: 365,
  phares: 365,
  canape: 180,
  moto: 60,
  autre: 120,
}

export function recallDays(service) {
  return RECALL_DAYS[serviceFamily(service)] || 120
}

export const CHECKLISTS = {
  interieur: [
    'Photos avant',
    'Aspiration complète (sièges, tapis, coffre)',
    'Plastiques et tableau de bord',
    'Sièges / textiles ou cuir',
    'Ciel de toit et montants',
    'Bas de portes et joints',
    'Vitres intérieures',
    'Désodorisation',
    'Photos après',
    'Tour du véhicule avec le client',
  ],
  exterieur: [
    'Photos avant',
    'Prélavage / mousse active',
    'Jantes et passages de roue',
    'Lavage manuel 2 seaux',
    'Rinçage et séchage microfibre',
    'Vitres extérieures',
    'Pneus (dressing)',
    'Photos après',
    'Tour du véhicule avec le client',
  ],
  complet: [
    'Photos avant',
    'Extérieur : prélavage, jantes, lavage, séchage',
    'Intérieur : aspiration complète',
    'Plastiques, tableau de bord, bas de portes',
    'Sièges / textiles ou cuir',
    'Vitres intérieur + extérieur',
    'Désodorisation et pneus',
    'Photos après',
    'Tour du véhicule avec le client',
  ],
  lustrage: [
    'Photos avant (en lumière)',
    'Lavage + décontamination',
    'Masquage plastiques et joints',
    'Test de passe sur un élément',
    'Polissage',
    'Contrôle à la lampe',
    'Protection (cire / sealant)',
    'Photos après',
    'Tour du véhicule avec le client',
  ],
  ceramique: [
    'Photos avant',
    'Lavage + décontamination',
    'Polissage de préparation',
    'Dégraissage (IPA)',
    'Application du traitement',
    'Temps de séchage respecté',
    'Photos après',
    'Consignes d’entretien données au client',
  ],
  phares: ['Photos avant', 'Masquage', 'Ponçage', 'Polissage', 'Protection UV', 'Photos après'],
  canape: ['Photos avant', 'Aspiration', 'Prétraitement des taches', 'Injection-extraction', 'Photos après', 'Consignes de séchage données'],
  moto: ['Photos avant', 'Protection des parties sensibles', 'Prélavage', 'Lavage', 'Séchage soufflé', 'Chaîne / plastiques', 'Photos après'],
  autre: ['Photos avant', 'Prestation réalisée', 'Photos après', 'Tour avec le client'],
}

export function checklistFor(service) {
  return CHECKLISTS[serviceFamily(service)] || CHECKLISTS.autre
}

// Famille → catégorie de produits consommés (table products.applies_to).
export function stockCategory(service) {
  const f = serviceFamily(service)
  if (f === 'interieur' || f === 'canape') return 'interieur'
  if (f === 'lustrage' || f === 'ceramique' || f === 'phares') return 'lustrage'
  if (f === 'complet') return 'complet'
  return 'exterieur'
}
