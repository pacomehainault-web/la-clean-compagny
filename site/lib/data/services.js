// Formules principales (forfaits habitacle)
export const FORMULAS = [
  {
    id: 'coup-de-propre',
    name: 'Coup de Propre',
    tagline: 'La remise en état essentielle',
    basePrice: 109,
    duration: '2h à 3h',
    description:
      "L'entretien régulier idéal. Une remise au propre de votre habitacle comprenant l'aspiration complète, le dépoussiérage des plastiques, le nettoyage des tapis, des vitres intérieures et du coffre. Parfait pour rafraîchir votre véhicule.",
    includes: [
      'Aspiration complète habitacle et coffre',
      'Dépoussiérage tableau de bord, contre-portes et plastiques',
      'Nettoyage des vitres intérieures',
      'Nettoyage tapis et moquettes',
      'Désodorisation de l’habitacle',
    ],
    featured: false,
  },
  {
    id: 'sortie-concession',
    name: 'Sortie de Concession',
    tagline: 'La formule la plus complète',
    basePrice: 179,
    duration: '4h à 6h',
    description:
      "Notre prestation signature pour retrouver un intérieur comme neuf. Inclut tout le contenu du « Coup de Propre », avec en supplément : le nettoyage en profondeur et le dressing UV de tous les plastiques, le shampouinage des tapis, le nettoyage minutieux des moindres détails (rails de sièges, aérateurs, contre-portes, recoins difficiles d'accès) et un contrôle qualité rigoureux. Le summum de la propreté.",
    // Mis en avant sur tout le site (accueil, pages villes, devis) pour pousser
    // les demandes de devis sur cette formule : nettoyage extérieur offert +
    // badge "Recommandé".
    promo: 'Nettoyage extérieur offert',
    ribbonLabel: '⭐ Recommandé',
    // Le lavage extérieur (offert) est automatiquement coché et verrouillé dans
    // le configurateur de devis dès que cette formule est choisie — cf.
    // QuoteWizard, qui lit ce champ pour ne jamais le facturer en plus.
    includedExtraIds: ['lavage-exterieur'],
    includes: [
      'Tout le contenu de la formule Coup de Propre',
      'Nettoyage en profondeur et dressing UV de tous les plastiques',
      'Shampouinage des tapis et moquettes',
      'Nettoyage minutieux des recoins difficiles d’accès (rails de sièges, aérateurs, contre-portes)',
      'Dressing cuir ou tissu selon sellerie',
      'Contrôle qualité rigoureux',
      'Nettoyage extérieur complet OFFERT (prélavage, lavage, jantes, vitres, séchage)',
    ],
    featured: true,
  },
]

// Prestations complémentaires. La plupart ont un tarif de départ (palier Citadine
// de la grille tarifaire, cf. lib/data/pricing.js) ; celles qui n'ont pas
// d'équivalent dans la nouvelle grille (céramique, nettoyage moteur) restent sur devis.
//
// `pricingRef` : identifiant de la prestation correspondante dans
// lib/data/pricing.js (EXTERIOR_PRICING / CORRECTION_PRICING), quand il diffère
// de l'id local ci-dessous. C'est ce qui permet au formulaire de devis de
// retrouver le prix exact par gabarit (cf. QuoteWizard → getExactPrice) sans
// dupliquer les chiffres ni les faire dériver d'un catalogue à l'autre.
export const COMPLEMENTARY_SERVICES = [
  {
    id: 'lavage-exterieur',
    name: 'Lavage extérieur',
    basePrice: 45,
    description:
      'Lavage carrosserie en deux phases, sans risque de micro-rayure, pour une brillance immédiate.',
    category: 'exterieur',
  },
  {
    id: 'polissage',
    name: 'Polissage',
    basePrice: 350,
    pricingRef: 'correction-avancee',
    description:
      'Correction de peinture pour effacer hologrammes, micro-rayures et ternissures et redonner sa profondeur à la carrosserie.',
    category: 'exterieur',
  },
  {
    id: 'lustrage-classique',
    name: 'Lustrage classique',
    basePrice: 150,
    pricingRef: 'lustrage-express',
    description:
      "Finition brillance sans correction agressive, pour raviver l'éclat de la peinture entre deux polissages.",
    category: 'exterieur',
    // Le lavage extérieur est un prérequis technique : impossible de lustrer
    // une carrosserie qui n'a pas été lavée. Voir QuoteWizard → applyServiceDependencies.
    requires: ['lavage-exterieur'],
    requiresNote:
      'Pour assurer une prestation dans les meilleures conditions et garantir un résultat optimal, le lavage extérieur est obligatoirement inclus avec le lustrage.',
  },
  {
    id: 'lustrage-minute',
    name: 'Lustrage minute',
    basePrice: 59,
    description:
      "Notre prestation phare : une finition brillance express qui ravive la peinture et sublime chaque reflet, sans les heures d'un lustrage complet.",
    category: 'exterieur',
  },
  {
    id: 'decontamination',
    name: 'Décontamination',
    basePrice: 100,
    pricingRef: 'decontamination-complete',
    description:
      'Élimination des particules ferreuses, goudrons et résidus incrustés que le lavage seul ne retire pas.',
    category: 'exterieur',
  },
  {
    id: 'ceramique',
    name: 'Traitement céramique',
    priceOnRequest: true,
    description:
      'Protection longue durée qui sublime la brillance et facilite l’entretien face aux salissures et UV.',
    category: 'exterieur',
  },
  {
    id: 'nettoyage-moteur',
    name: 'Nettoyage moteur',
    priceOnRequest: true,
    description:
      'Dégraissage et nettoyage soigné du compartiment moteur, en toute sécurité pour les composants électroniques.',
    category: 'technique',
  },
  {
    id: 'traitement-cuir',
    name: 'Traitement cuir',
    basePrice: 60,
    description:
      'Nettoyage, nourrissage et protection du cuir pour préserver sa souplesse et éviter le craquellement.',
    category: 'interieur',
  },
]

export const OPTICS_RENOVATION = {
  id: 'renovation-optiques',
  name: 'Rénovation optiques',
  basePrice: 80,
  description:
    "Ponçage et polissage des optiques jaunies ou ternes pour retrouver transparence et sécurité d'éclairage.",
}

export const OZONE_TREATMENT = {
  id: 'desinfection-ozone',
  name: 'Désinfection à l’ozone',
  basePrice: 59,
  description:
    'Traitement par ozone qui élimine bactéries, acariens, moisissures et odeurs incrustées (tabac, animaux…) en profondeur.',
}

export const ALL_SERVICES = [
  ...FORMULAS,
  ...COMPLEMENTARY_SERVICES,
  OPTICS_RENOVATION,
  OZONE_TREATMENT,
]

export function getServiceById(id) {
  return ALL_SERVICES.find((s) => s.id === id)
}
