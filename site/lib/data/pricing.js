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
    // Mis en avant sur l'accueil et /prestations : nettoyage extérieur inclus
    // gratuitement, quel que soit le gabarit (cf. lib/data/services.js pour le
    // détail complet de la formule).
    promo: 'Nettoyage extérieur offert',
    ribbonLabel: '⭐ Recommandé',
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
    includes: ['Prélavage & lavage manuel', 'Passages de roues', 'Décontamination légère'],
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

// Catégorie Moto — exclusivité Espace Particulier (jamais affichée côté Pro).
export const MOTO_PRICING = {
  id: 'moto',
  name: 'Moto',
  description: 'Nettoyage, lustrage et protection pour motos et scooters : la même exigence que pour vos véhicules.',
  fromPrice: 65,
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

// Gabarits tarifés des Pass Entretien — taxonomie dédiée aux abonnements : les
// utilitaires y sont détaillés en 3 paliers (contrairement à VEHICLE_TIERS, qui
// les regroupe avec le Grand SUV pour les prestations à l'unité).
export const PASS_TIERS = [
  { id: 'citadine', emoji: '🚗', label: 'Citadine' },
  { id: 'compacte-berline', emoji: '🚘', label: 'Compacte / Berline' },
  { id: 'suv-break', emoji: '🚙', label: 'SUV / Break' },
  { id: 'grand-suv', emoji: '🚙', label: 'Grand SUV / 7 places' },
  { id: 'petit-utilitaire', emoji: '🚐', label: 'Petit utilitaire' },
  { id: 'utilitaire-moyen', emoji: '🚐', label: 'Utilitaire moyen' },
  { id: 'grand-utilitaire', emoji: '🚐', label: 'Grand utilitaire' },
]

const PASS_INCLUDES = [
  'Remise au meilleur niveau esthétique comprise',
  'Pas de supplément lié à l’état courant du véhicule',
  'Suivi personnalisé du véhicule pendant 1 an',
  'Historique des interventions',
  'Photos et suivi de l’évolution du véhicule',
  'Priorité de réservation',
  '-10 % sur les prestations complémentaires',
]

export const PASS_6_MOIS = {
  id: 'pass-6-mois',
  eyebrow: '🔵',
  badge: '6 mois',
  name: 'Pass Semestriel',
  subtitle: 'Votre véhicule suivi pendant 1 an',
  frequency: '2 passages sur 12 mois',
  description:
    'Une formule idéale pour conserver son véhicule propre et soigné toute l’année avec un suivi régulier par La Clean Compagny.',
  includes: ['2 passages sur 12 mois', '1 passage tous les 6 mois', ...PASS_INCLUDES],
  pricesLabel: 'Tarifs — contrat 12 mois (Pass 6 mois)',
  period: 'an',
  prices: {
    citadine: 299,
    'compacte-berline': 329,
    'suv-break': 359,
    'grand-suv': 389,
    'petit-utilitaire': 359,
    'utilitaire-moyen': 429,
    'grand-utilitaire': 499,
  },
  prestigeOnRequest: true,
}

export const PASS_3_MOIS = {
  id: 'pass-3-mois',
  eyebrow: '🔷',
  badge: '3 mois',
  name: 'Pass Trimestriel',
  subtitle: 'Le suivi régulier de votre véhicule',
  frequency: '4 passages sur 12 mois (1 passage tous les 3 mois)',
  description:
    'La formule idéale pour les clients qui souhaitent maintenir leur véhicule dans un excellent état toute l’année.',
  includes: ['4 passages sur 12 mois', '1 passage tous les 3 mois', ...PASS_INCLUDES],
  pricesLabel: 'Tarifs — contrat 12 mois (Pass 3 mois)',
  period: 'an',
  prices: {
    citadine: 499,
    'compacte-berline': 549,
    'suv-break': 599,
    'grand-suv': 649,
    'petit-utilitaire': 599,
    'utilitaire-moyen': 699,
    'grand-utilitaire': 799,
  },
  prestigeOnRequest: true,
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
  "Les prestations sont réalisées sur rendez-vous.",
  "Le véhicule doit être accessible et présenté dans des conditions permettant la réalisation de la prestation.",
  "Toute prestation ou demande supplémentaire non prévue dans la formule initiale fera l'objet d'une information et d'une validation préalable du client.",
  "Les Pass Entretien (6 mois et 3 mois) sont souscrits pour une durée de 12 mois. Ils ne sont pas cumulables avec d'autres offres, ne sont pas cessibles et sont utilisables uniquement pour le véhicule concerné.",
]

export function getTierPrice(service, tierId) {
  return service.prices ? service.prices[tierId] : undefined
}

// ---------------------------------------------------------------------------
// Source unique de vérité "Prestations × Gabarits" — consommée aussi bien par
// le sélecteur de la page d'accueil que par le formulaire de devis, pour que
// les deux affichent strictement le même prix pour une même combinaison.
// Assemblée à partir des grilles ci-dessus : aucun chiffre n'est dupliqué.
// ---------------------------------------------------------------------------
export const PRICING_MATRIX = [...FORMULAS_PRICING, ...EXTERIOR_PRICING, ...CORRECTION_PRICING].reduce(
  (matrix, service) => {
    matrix[service.id] = service.prices
    return matrix
  },
  {}
)

// Une prestation n'a pas forcément de grille par gabarit (ex. lustrage minute,
// rénovation optiques : prix fixe quel que soit le véhicule). On le distingue
// explicitement d'un simple "gabarit absent de la grille" (ex. Prestige, ou un
// véhicule hors grille) : les deux cas doivent afficher "Sur devis", mais pour
// des raisons différentes — utile pour le composant appelant.
export function hasPriceGrid(serviceId) {
  return Boolean(PRICING_MATRIX[serviceId])
}

// Prix exact pour une prestation donnée, pour un gabarit donné. `undefined` si
// cette prestation n'a pas de grille, ou si ce gabarit précis n'y figure pas
// (Prestige et les véhicules hors grille grand public → toujours sur devis).
export function getExactPrice(serviceId, tierId) {
  return tierId ? PRICING_MATRIX[serviceId]?.[tierId] : undefined
}

// Correspondance entre la taxonomie du configurateur de devis (lib/data/vehicles.js,
// orientée "types de véhicules") et celle de la grille tarifaire ci-dessus
// (VEHICLE_TIERS, orientée "paliers de prix"). La Moto a son propre tarif fixe
// (cf. MOTO_PRICING) plutôt qu'une grille par prestation ; les gabarits
// professionnels (camion, tracteur, pelleteuse) restent toujours sur devis,
// comme annoncé sur l'espace Pro — ils n'ont donc volontairement pas d'entrée
// ici, ce qui fait retomber getExactPrice() sur "Sur devis" pour eux.
export const VEHICLE_TYPE_TO_TIER = {
  citadine: 'citadine',
  berline: 'compacte-berline',
  suv: 'suv-break',
  monospace: 'grand-suv',
  utilitaire: 'grand-suv',
}
