// Grille tarifaire par gabarit — source unique de vérité pour :
// - le sélecteur dynamique de la page d'accueil (PricingSelector)
// - la matrice tarifaire complète de la page /prestations
//
// Les 4 premiers gabarits ont un prix par palier ; "Prestige / Collection" est
// systématiquement sur devis après inspection (cf. PRESTIGE_SECTION plus bas).

export const VEHICLE_TIERS = [
  { id: 'citadine', emoji: '🚗', label: 'Citadine' },
  { id: 'compacte-berline', emoji: '🚘', label: 'Berline / Compacte' },
  { id: 'suv-break', emoji: '🚙', label: 'SUV / Break' },
  { id: 'grand-suv', emoji: '🚙', label: 'Grand SUV / 7 places / Utilitaires' },
  { id: 'prestige', emoji: '🏎️', label: 'Prestige / Collection' },
]

// Paliers couverts par une grille de prix (Prestige exclu : toujours sur devis)
export const PRICED_TIER_IDS = ['citadine', 'compacte-berline', 'suv-break', 'grand-suv']

export const FORMULAS_PRICING = [
  {
    id: 'coup-de-propre',
    name: 'Coup de Propre',
    tagline: "L'entretien régulier de votre véhicule.",
    prices: { citadine: 109, 'compacte-berline': 119, 'suv-break': 129, 'grand-suv': 139 },
  },
  {
    id: 'sortie-concession',
    name: 'Sortie de Concession',
    tagline: 'Une remise en état complète pour retrouver un véhicule comme neuf.',
    prices: { citadine: 179, 'compacte-berline': 199, 'suv-break': 219, 'grand-suv': 239 },
  },
]

export const EXTERIOR_PRICING = [
  {
    id: 'lavage-exterieur',
    name: 'Lavage extérieur',
    prices: { citadine: 45, 'compacte-berline': 50, 'suv-break': 60, 'grand-suv': 70 },
    includes: ['Prélavage', 'Lavage manuel', 'Jantes', 'Rinçage', 'Séchage', 'Finitions'],
  },
  {
    id: 'lavage-exterieur-approfondi',
    name: 'Lavage extérieur approfondi',
    prices: { citadine: 70, 'compacte-berline': 80, 'suv-break': 90, 'grand-suv': 100 },
    includes: ['Idem lavage extérieur', 'Passages de roues', 'Décontamination légère'],
  },
  {
    id: 'decontamination-complete',
    name: 'Décontamination complète',
    prices: { citadine: 100, 'compacte-berline': 120, 'suv-break': 140, 'grand-suv': 160 },
    includes: ['Lavage approfondi', 'Décontamination chimique & mécanique', 'Rinçage', 'Séchage', 'Finition'],
  },
]

export const CORRECTION_PRICING = [
  {
    id: 'lustrage-express',
    name: 'Lustrage Express',
    tagline: 'Ravive la brillance.',
    prices: { citadine: 150, 'compacte-berline': 170, 'suv-break': 190, 'grand-suv': 210 },
  },
  {
    id: 'lustrage-finition',
    name: 'Lustrage Finition',
    tagline: 'Améliore la profondeur.',
    prices: { citadine: 250, 'compacte-berline': 280, 'suv-break': 310, 'grand-suv': 340 },
  },
  {
    id: 'correction-avancee',
    name: 'Correction avancée',
    tagline: 'Correction des défauts.',
    prices: { citadine: 350, 'compacte-berline': 400, 'suv-break': 450, 'grand-suv': 500 },
  },
]

export const CORRECTION_PRESTIGE = {
  id: 'correction-complete-prestige',
  name: 'Correction complète / Prestige',
  description: 'Correction des défauts les plus marqués, sur devis après inspection.',
  fromPrice: 450,
}

export const LUSTRAGE_MINUTE_HIGHLIGHT = {
  id: 'lustrage-minute',
  name: 'Lustrage minute',
  description: "Notre prestation express pour raviver l'éclat entre deux entretiens.",
  fromPrice: 59,
}

export const PRICING_NOTES = {
  decontaminationInLustrage: 'La décontamination est comprise dans le lustrage.',
}

export const OPTICS_PRICING = {
  id: 'renovation-optiques',
  name: 'Rénovation optiques',
  unit: 'la paire',
  fromPrice: 80,
  levels: [
    { id: 'leger', label: 'Léger', price: 80 },
    { id: 'intermediaire', label: 'Intermédiaire', price: 100 },
    { id: 'important', label: 'Important', price: 120 },
  ],
}

export const ADDITIONAL_CARE = [
  { id: 'textile-cible', name: 'Nettoyage textile ciblé', price: 40 },
  { id: 'textile-complet', name: 'Nettoyage textile complet', price: 70 },
  { id: 'cuir-soin', name: 'Nettoyage + soin cuir', price: 60 },
  { id: 'cuir-complet', name: 'Sellerie cuir complète', price: 80 },
  { id: 'coffre', name: 'Nettoyage approfondi du coffre', price: 30 },
  { id: 'vitres', name: 'Nettoyage complet des vitres', price: 30 },
  { id: 'jantes-approfondi', name: 'Nettoyage approfondi des jantes', price: 40 },
  { id: 'desodorisation-pro', name: 'Désodorisation professionnelle', price: 30 },
  { id: 'odeurs-tenaces', name: 'Traitement odeurs tenaces', priceOnRequest: true },
]

export const PASS_TRIMESTRIEL = {
  id: 'pass-trimestriel',
  name: 'Pass Entretien Trimestriel',
  price: 249,
  period: 'trimestre',
  includes: [
    '3 passages dans le trimestre (3× Coup de Propre)',
    'Priorité de réservation',
    'Tarif préférentiel sur les prestations complémentaires',
  ],
}

export const PASS_ANNUEL = {
  id: 'pass-annuel',
  name: 'Pass Entretien Annuel',
  tagline: 'Le suivi esthétique pendant 1 an.',
  period: 'an',
  prices: { citadine: 499, 'compacte-berline': 549, 'suv-break': 599, 'grand-suv': 649 },
  prestigeOnRequest: true,
  includes: [
    '1 passage tous les 3 mois (4 passages au total)',
    "Remise au meilleur niveau esthétique prévu par la formule, sans supplément salissure",
    'Suivi personnalisé et historique',
    'Photos avant / après',
    'Recommandations personnalisées',
    'Priorité de réservation',
    '-10 % sur les prestations complémentaires',
  ],
  commitmentNote: 'Engagement de 12 mois. Les grosses rénovations restent hors forfait.',
}

export const PRESTIGE_SECTION = {
  eyebrow: 'Prestige & Collection',
  title: 'Un soin à la hauteur de véhicules d’exception',
  brands: ['Porsche', 'Ferrari', 'Lamborghini', 'Aston Martin', 'McLaren', 'Maserati', 'Bentley', 'Rolls-Royce', 'Supercars'],
  text: 'Chaque véhicule possède ses propres matériaux, contraintes et niveaux d’exigence. Nous adaptons la prestation au véhicule.',
  fromPrice: 249,
  note: 'Pour un nettoyage approfondi. Le reste (lustrage, correction, protection) est établi sur devis après inspection.',
}

export const PRICING_TERMS = [
  "Les tarifs indiqués sont des tarifs « à partir de » et peuvent varier selon le gabarit, la configuration et l'état du véhicule.",
  "Les véhicules présentant des salissures ou traitements spécifiques nécessitant une intervention technique particulière peuvent faire l'objet d'un devis personnalisé.",
  "Les prestations de rénovation, correction de peinture, rénovation d'optiques et traitements spécifiques ne sont pas incluses dans les prestations de nettoyage classiques, sauf mention contraire.",
  "Le Pass Entretien est souscrit pour une durée de 12 mois et comprend 4 passages, à raison d'un passage tous les 3 mois.",
]

export function getTierPrice(service, tierId) {
  return service.prices ? service.prices[tierId] : undefined
}
