// Les 13 paires avant/après du carrousel (accueil + galerie). Chaque véhicule a
// été identifié à partir des photos elles-mêmes (marque visible sur le volant,
// la plage arrière ou le seuil de porte) pour donner un alt et un nom de
// fichier réellement descriptifs, au lieu d'un simple numéro. `alt` est la
// description de base ; BeforeAfterSlider et StaticBeforeAfterGallery y
// ajoutent eux-mêmes le suffixe « — avant »/« — après ».
const PAIRS = [
  { n: 1, slug: 'coffre-citadine', alt: 'Coffre de citadine nettoyé en profondeur à Angers' },
  { n: 2, slug: 'interieur-peugeot-308', alt: 'Habitacle de Peugeot 308 nettoyé à Angers' },
  { n: 3, slug: 'banquette-mercedes', alt: 'Banquette cuir de Mercedes nettoyée à Angers' },
  { n: 4, slug: 'banquette-hyundai', alt: 'Banquette arrière de Hyundai nettoyée à Angers' },
  { n: 5, slug: 'interieur-hyundai-tucson', alt: 'Habitacle de Hyundai Tucson nettoyé à Angers' },
  { n: 6, slug: 'interieur-citroen', alt: 'Habitacle de Citroën nettoyé à Angers' },
  { n: 7, slug: 'interieur-citroen-c4-picasso', alt: 'Habitacle de Citroën C4 Picasso nettoyé à Angers' },
  { n: 8, slug: 'tapis-peugeot', alt: 'Tapis de sol de Peugeot nettoyé en profondeur à Angers' },
  { n: 9, slug: 'interieur-renault', alt: 'Banquette arrière de Renault nettoyée à Angers' },
  { n: 10, slug: 'interieur-renault-koleos', alt: 'Habitacle cuir de Renault Koleos nettoyé à Angers' },
  { n: 11, slug: 'plancher-voiture', alt: 'Plancher de voiture nettoyé en profondeur à Angers' },
  { n: 12, slug: 'interieur-toyota-chr', alt: 'Habitacle de Toyota C-HR nettoyé à Angers' },
  { n: 13, slug: 'interieur-alfa-romeo', alt: 'Habitacle cuir d’Alfa Romeo nettoyé à Angers' },
]

export const BEFORE_AFTER_PAIRS = PAIRS.map((p) => ({
  id: p.n,
  before: `/images/avant-apres/nettoyage-${p.slug}-angers-avant.jpg`,
  after: `/images/avant-apres/nettoyage-${p.slug}-angers-apres.jpg`,
  alt: p.alt,
}))

// Page Pro : parmi les 5 photos d'origine, seules 2 montrent vraiment une
// cabine d'engin de chantier (pelleteuse) — les 3 autres sont des utilitaires
// (Renault, Peugeot, Volkswagen), identifiés eux aussi directement sur les
// photos. D'où l'intitulé de la section, volontairement plus large que « engins
// de chantier » (cf. app/pro/page.js).
const BTP_SOURCE = [
  { n: 1, slug: 'cabine-pelleteuse', alt: 'Cabine de pelleteuse nettoyée à Angers' },
  { n: 2, slug: 'utilitaire-renault', alt: 'Utilitaire Renault nettoyé à Angers' },
  { n: 3, slug: 'utilitaire-peugeot', alt: 'Utilitaire Peugeot nettoyé à Angers' },
  { n: 4, slug: 'cabine-engin-chantier', alt: "Cabine d'engin de chantier nettoyée à Angers" },
  { n: 5, slug: 'utilitaire-volkswagen', alt: 'Utilitaire Volkswagen nettoyé à Angers' },
]

export const BTP_PAIRS = BTP_SOURCE.map((p) => ({
  id: p.n,
  before: `/images/btp/nettoyage-${p.slug}-angers-avant.jpg`,
  after: `/images/btp/nettoyage-${p.slug}-angers-apres.jpg`,
  alt: p.alt,
}))
