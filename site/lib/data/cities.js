// `intro` : 1er paragraphe, utilisé comme réponse directe (PageHero lead) sur
// TOUTES les pages ville. `extra` : paragraphe(s) complémentaire(s), propres à
// chaque commune (jamais un simple gabarit avec le nom qui change), affichés
// sous l'intro pour que chaque page dépasse la simple fiche générique.
// `neighborhoods` et `faq` : réservés à Angers, notre page la plus importante
// (cf. app/zone-intervention/[ville]/page.js).
export const CITIES = [
  {
    slug: 'angers',
    name: 'Angers',
    distanceKm: 0,
    intro:
      "La Clean Compagny nettoie votre voiture à domicile à Angers et dans un rayon de 30 km. Nettoyage intérieur dès 109 €, rénovation complète dès 179 €, lustrage dès 59 €. Devis en ligne en quelques minutes.",
    extra: [
      "Angers, préfecture du Maine-et-Loire et cœur historique de l'Anjou, est notre port d'attache : c'est ici que La Clean Compagny est née, et c'est ici que nous intervenons le plus souvent, du centre-ville et du Château d'Angers jusqu'aux quartiers résidentiels les plus excentrés.",
      "Que vous habitiez en plein centre, dans un lotissement pavillonnaire ou un immeuble avec parking, nous nous adaptons : il suffit d'un accès minimal à l'eau et à l'électricité pour les prestations qui le nécessitent, et nous nous occupons du reste.",
    ],
    neighborhoods: [
      'Centre-ville',
      'La Doutre',
      'Monplaisir',
      'Belle-Beille',
      'Lac de Maine',
      'Saint-Serge',
      'Justices',
      'Roseraie',
      'Deux-Croix-Banchais',
    ],
    faq: [
      {
        question: 'Combien coûte un nettoyage de voiture à Angers ?',
        answer:
          "Comptez à partir de 109 € pour un Coup de Propre (nettoyage intérieur complet) et à partir de 179 € pour une Sortie de Concession (remise en état complète, nettoyage extérieur inclus). Le tarif exact dépend du gabarit de votre véhicule et de son état : il est confirmé lors du devis, sans surprise le jour J.",
      },
      {
        question: 'Quel délai pour avoir un rendez-vous à Angers ?',
        answer:
          "Nous répondons aux demandes de devis sous 24h ouvrées, et le rendez-vous est généralement fixé dans la semaine selon nos disponibilités. Pour les formules les plus complètes (Sortie de Concession, polissage, traitement céramique), mieux vaut anticiper de quelques jours, surtout en période de forte demande.",
      },
      {
        question: 'Faut-il être présent pendant le nettoyage ?',
        answer:
          "Ce n'est pas obligatoire, tant que nous disposons d'un accès au véhicule et, selon la prestation, à un point d'eau et d'électricité. Beaucoup de nos clients à Angers nous confient leurs clés et vaquent à leurs occupations pendant l'intervention.",
      },
      {
        question: "Intervenez-vous dans un parking d'immeuble ou de résidence ?",
        answer:
          "Oui, c'est fréquent en centre-ville et dans les quartiers comme Monplaisir ou la Roseraie. Il faut simplement un emplacement accessible et, idéalement, un point d'eau à proximité — nous en discutons ensemble au moment du devis pour organiser au mieux l'intervention.",
      },
      {
        question: 'Intervenez-vous en entreprise à Angers ?',
        answer:
          "Oui, nous intervenons aussi bien chez les particuliers qu'en entreprise, sur un véhicule isolé ou sur une flotte. Pour les professionnels basés à Angers, consultez notre espace Pro, avec facturation groupée et tarifs dégressifs au volume.",
      },
    ],
  },
  {
    slug: 'trelaze',
    name: 'Trélazé',
    distanceKm: 7,
    intro:
      'Nettoyage de voiture à domicile à Trélazé : intérieur, extérieur, lustrage et traitement céramique, directement chez vous, dans toute la commune.',
    extra: [
      "Ancienne cité ardoisière aux portes d'Angers, Trélazé fait partie de notre zone d'intervention quotidienne. Entre le bourg, les zones pavillonnaires et le secteur d'activité le long de la D323, nous nous déplaçons partout sur la commune pour un nettoyage automobile sans le moindre trajet à faire de votre côté.",
      "Beaucoup de nos clients trélazéens nous sollicitent pour un entretien régulier plutôt qu'une intervention ponctuelle : voir notre Pass Entretien, qui programme vos passages à l'avance sur toute l'année.",
    ],
  },
  {
    slug: 'avrille',
    name: 'Avrillé',
    distanceKm: 5,
    intro:
      "Nettoyage voiture à domicile à Avrillé : formules Coup de Propre et Sortie de Concession, lustrage, décontamination. Devis rapide, intervention sur place.",
    extra: [
      "Au nord-ouest de l'agglomération angevine, Avrillé compte autant de zones résidentielles que de secteurs d'activité économique. Nous intervenons dans les deux configurations : à domicile le week-end ou en soirée, comme sur le lieu de travail en journée, selon ce qui vous arrange le plus.",
      "La commune héberge aussi plusieurs concessions et garages : si vous venez de récupérer un véhicule neuf ou d'occasion à Avrillé, notre formule Sortie de Concession est pensée exactement pour ce moment-là.",
    ],
  },
  {
    slug: 'les-ponts-de-ce',
    name: 'Les Ponts-de-Cé',
    distanceKm: 7,
    intro:
      'Detailing automobile à domicile aux Ponts-de-Cé : nettoyage intérieur et extérieur, lustrage, traitement céramique, pour particuliers et professionnels.',
    extra: [
      "Ville aux cinq ponts enjambant la Loire, Les Ponts-de-Cé s'étend de part et d'autre du fleuve, entre le centre historique et les quartiers plus récents côté Sorges. Cette géographie en deux rives ne change rien pour nous : où que vous soyez sur la commune, nous venons avec notre propre matériel, sans avoir besoin d'un garage ou d'un point d'eau à haute pression chez vous.",
      "C'est aussi une commune où beaucoup de véhicules vivent en extérieur, exposés au vent et aux dépôts du fleuve tout proche : un bon argument pour envisager une décontamination ou un traitement céramique en complément du nettoyage classique.",
    ],
  },
  {
    slug: 'bouchemaine',
    name: 'Bouchemaine',
    distanceKm: 9,
    intro:
      'Nettoyage automobile à domicile à Bouchemaine : intérieur, extérieur, lustrage et prestations complémentaires, sur rendez-vous.',
    extra: [
      "Nichée au confluent de la Maine et de la Loire, Bouchemaine profite elle aussi de notre service de nettoyage automobile premium, avec un rendez-vous pris directement à votre domicile. La commune, très résidentielle, se prête particulièrement bien aux formules les plus complètes : beaucoup de nos clients bouchemainois profitent d'une matinée ou d'un week-end pour nous confier leur véhicule pendant qu'ils vaquent à d'autres occupations.",
    ],
  },
  {
    slug: 'saint-barthelemy-danjou',
    name: "Saint-Barthélemy-d'Anjou",
    distanceKm: 4,
    intro:
      "Nettoyage voiture à domicile à Saint-Barthélemy-d'Anjou : intervention rapide, formules à partir de 109 €, zone d'intervention couvrant toute la commune.",
    extra: [
      "Commune limitrophe d'Angers à l'est, Saint-Barthélemy-d'Anjou fait partie du cœur de notre zone d'intervention : le trajet est si court qu'il n'entre dans aucun calcul de supplément, quelle que soit la prestation choisie. Entre zones pavillonnaires et secteurs d'activité proches de la rocade, nous nous adaptons à chaque configuration.",
    ],
  },
  {
    slug: 'verrieres-en-anjou',
    name: 'Verrières-en-Anjou',
    distanceKm: 10,
    intro:
      "Nettoyage et detailing automobile à domicile à Verrières-en-Anjou (Saint-Sylvain-d'Anjou, Pellouailles-les-Vignes) : intérieur, extérieur, lustrage.",
    extra: [
      "Au nord-est de l'agglomération angevine, Verrières-en-Anjou réunit plusieurs anciens bourgs — Saint-Sylvain-d'Anjou, Pellouailles-les-Vignes — sur un territoire assez étendu. Nous couvrons l'ensemble de la commune de la même façon, sans distinction de secteur ni supplément de déplacement dans notre zone habituelle.",
    ],
  },
  {
    slug: 'beaucouze',
    name: 'Beaucouzé',
    distanceKm: 6,
    intro:
      'Nettoyage de voiture à domicile à Beaucouzé : particuliers et professionnels, formules Coup de Propre, Sortie de Concession, lustrage et plus.',
    extra: [
      "À l'ouest d'Angers, Beaucouzé et son pôle d'activité (Angers Grand Parc, zones commerciales et industrielles) font partie de notre secteur d'intervention pour l'entretien esthétique de véhicules particuliers et utilitaires. Beaucoup de professionnels basés sur la zone nous sollicitent directement sur leur lieu de travail pour limiter l'immobilisation de leurs véhicules.",
    ],
  },
  {
    slug: 'murs-erigne',
    name: 'Mûrs-Érigné',
    distanceKm: 12,
    intro:
      'Nettoyage automobile à domicile à Mûrs-Érigné : intervention sur place, devis rapide, prestations intérieures et extérieures sur-mesure.',
    extra: [
      "Au sud de l'agglomération, entre Loire et Layon, Mûrs-Érigné fait partie des communes un peu plus excentrées que nous desservons sans supplément dans notre rayon habituel de 30 km. Le cadre semi-rural de la commune n'empêche rien : nous venons avec tout notre matériel, où que vous soyez installé.",
    ],
  },
  {
    slug: 'montreuil-juigne',
    name: 'Montreuil-Juigné',
    distanceKm: 10,
    intro:
      'Nettoyage voiture à domicile à Montreuil-Juigné : intérieur, extérieur, lustrage, decontamination. Intervention directement chez vous.',
    extra: [
      "Au nord d'Angers, sur les bords de Mayenne, Montreuil-Juigné bénéficie de notre service de detailing automobile itinérant, pour un véhicule impeccable sans quitter votre secteur. La commune, en majorité résidentielle, se prête bien à une intervention en journée pendant que vous êtes au travail, ou le week-end à votre domicile.",
    ],
  },
  {
    slug: 'ecouflant',
    name: 'Écouflant',
    distanceKm: 8,
    intro:
      'Nettoyage et rénovation automobile à domicile à Écouflant : formules intérieures et extérieures, lustrage, sur rendez-vous.',
    extra: [
      "Aux portes nord d'Angers, le long de la Maine, Écouflant fait partie de notre zone de déplacement habituelle pour les prestations de nettoyage et de rénovation automobile. Sa proximité immédiate avec Angers en fait l'une des communes où nous intervenons le plus facilement, souvent dans la foulée d'un rendez-vous pris en ville.",
    ],
  },
  {
    slug: 'sainte-gemmes-sur-loire',
    name: 'Sainte-Gemmes-sur-Loire',
    distanceKm: 8,
    intro:
      'Detailing automobile premium à domicile à Sainte-Gemmes-sur-Loire : nettoyage intérieur/extérieur, lustrage, traitement céramique.',
    extra: [
      "Au sud d'Angers, en bord de Loire, Sainte-Gemmes-sur-Loire est couverte par notre service de detailing automobile premium à domicile. C'est une commune où beaucoup de véhicules restent garés en extérieur à l'année : un bon argument pour penser à une protection céramique en complément d'un nettoyage classique, afin de limiter l'incidence des UV et des dépôts naturels sur la carrosserie.",
    ],
  },
]

export function getCity(slug) {
  return CITIES.find((c) => c.slug === slug)
}
