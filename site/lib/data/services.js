// Formules principales (forfaits habitacle)
export const FORMULAS = [
  {
    id: 'coup-de-propre',
    name: 'Coup de Propre',
    tagline: 'La remise en état essentielle',
    basePrice: 95,
    duration: '2h à 3h',
    description:
      "L'entretien qu'il faut pour retrouver un habitacle sain et net, sans attendre le grand nettoyage. Idéal en entretien régulier.",
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
    basePrice: 149,
    duration: '4h à 6h',
    description:
      "Le véhicule ressort comme au premier jour : un nettoyage en profondeur, poste par poste, pour un rendu digne d'une sortie de concession.",
    includes: [
      'Aspiration complète et dépoussiérage intégral',
      'Shampouinage sièges, moquettes et coffre',
      'Nettoyage en profondeur de tous les plastiques',
      'Dressing cuir ou tissu selon sellerie',
      'Nettoyage vitres intérieures et extérieures',
      'Nettoyage jantes et passages de roue',
      'Désodorisation professionnelle',
      'Finitions et contrôle qualité',
    ],
    featured: true,
  },
]

// Prestations complémentaires, sur devis
export const COMPLEMENTARY_SERVICES = [
  {
    id: 'lavage-exterieur',
    name: 'Lavage extérieur',
    basePrice: 35,
    description:
      'Lavage carrosserie en deux phases, sans risque de micro-rayure, pour une brillance immédiate.',
    category: 'exterieur',
  },
  {
    id: 'polissage',
    name: 'Polissage',
    basePrice: 120,
    description:
      'Correction de peinture pour effacer hologrammes, micro-rayures et ternissures et redonner sa profondeur à la carrosserie.',
    category: 'exterieur',
  },
  {
    id: 'lustrage',
    name: 'Lustrage',
    basePrice: 90,
    description:
      "Finition brillance sans correction agressive, pour raviver l'éclat de la peinture entre deux polissages.",
    category: 'exterieur',
  },
  {
    id: 'decontamination',
    name: 'Décontamination',
    basePrice: 70,
    description:
      'Élimination des particules ferreuses, goudrons et résidus incrustés que le lavage seul ne retire pas.',
    category: 'exterieur',
  },
  {
    id: 'ceramique',
    name: 'Traitement céramique',
    basePrice: 249,
    description:
      'Protection longue durée qui sublime la brillance et facilite l’entretien face aux salissures et UV.',
    category: 'exterieur',
  },
  {
    id: 'nettoyage-moteur',
    name: 'Nettoyage moteur',
    basePrice: 39,
    description:
      'Dégraissage et nettoyage soigné du compartiment moteur, en toute sécurité pour les composants électroniques.',
    category: 'technique',
  },
  {
    id: 'traitement-cuir',
    name: 'Traitement cuir',
    basePrice: 79,
    description:
      'Nettoyage, nourrissage et protection du cuir pour préserver sa souplesse et éviter le craquellement.',
    category: 'interieur',
  },
]

export const OPTICS_RENOVATION = {
  id: 'renovation-optiques',
  name: 'Rénovation optiques',
  basePrice: 69,
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
