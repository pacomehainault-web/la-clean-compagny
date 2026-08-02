// ⚠️ AVIS TEMPORAIRES — À REMPLACER PAR DE VRAIS AVIS GOOGLE
// Chaque avis a isPlaceholder: true. Remplacez le texte, l'auteur et la note
// par de vrais avis (copiés depuis votre fiche Google), puis passez
// isPlaceholder à false (ou supprimez le champ) une fois fait.
// Lien vers vos avis Google : voir CONTACT.googleReviewUrl dans lib/constants.js

export const REVIEWS = [
  {
    author: 'Julien M.',
    rating: 5,
    text: "Prestation Sortie de Concession sur mon SUV : un travail minutieux, l'habitacle est comme neuf. Enzo est passionné et ça se voit dans le résultat.",
    isPlaceholder: true,
  },
  {
    author: 'Camille R.',
    rating: 5,
    text: 'Traitement céramique impeccable, la peinture n’a jamais été aussi brillante. Ponctuel, sérieux et de très bons conseils.',
    isPlaceholder: true,
  },
  {
    author: 'Thomas B.',
    rating: 5,
    text: 'Formule Coup de Propre pour un entretien régulier de mon utilitaire pro : rapide, efficace, toujours au rendez-vous.',
    isPlaceholder: true,
  },
  {
    author: 'Sophie L.',
    rating: 5,
    text: "Rénovation d'optiques bluffante, on dirait des phares neufs. Un vrai souci du détail du début à la fin.",
    isPlaceholder: true,
  },
  {
    author: 'Alexandre P.',
    rating: 5,
    text: 'Décontamination et polissage sur ma berline : résultat digne d’une sortie de concession. Je recommande sans hésiter.',
    isPlaceholder: true,
  },
]

export const AGGREGATE_RATING = {
  ratingValue: 5,
  reviewCount: REVIEWS.length,
}
