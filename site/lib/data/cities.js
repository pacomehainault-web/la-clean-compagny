export const CITIES = [
  {
    slug: 'angers',
    name: 'Angers',
    distanceKm: 0,
    intro:
      "Angers, préfecture du Maine-et-Loire et cœur historique de l'Anjou, est notre port d'attache. Du centre-ville et du Château d'Angers jusqu'aux quartiers de la Doutre et de Monplaisir, nous intervenons directement chez vous ou à domicile pour redonner à votre véhicule l'éclat qu'il mérite.",
  },
  {
    slug: 'trelaze',
    name: 'Trélazé',
    distanceKm: 7,
    intro:
      "Ancienne cité ardoisière aux portes d'Angers, Trélazé fait partie de notre zone d'intervention quotidienne. Nous nous déplaçons directement sur place pour un detailing automobile haut de gamme, sans que vous ayez à vous soucier du trajet.",
  },
  {
    slug: 'avrille',
    name: 'Avrillé',
    distanceKm: 5,
    intro:
      "Au nord-ouest de l'agglomération angevine, Avrillé bénéficie de notre service de nettoyage automobile à domicile ou en entreprise, avec le même niveau d'exigence que pour un véhicule de prestige.",
  },
  {
    slug: 'les-ponts-de-ce',
    name: 'Les Ponts-de-Cé',
    distanceKm: 7,
    intro:
      "Ville aux cinq ponts enjambant la Loire, Les Ponts-de-Cé fait partie des communes que nous couvrons régulièrement pour des prestations de detailing intérieur et extérieur, chez les particuliers comme pour les flottes professionnelles.",
  },
  {
    slug: 'bouchemaine',
    name: 'Bouchemaine',
    distanceKm: 9,
    intro:
      "Nichée au confluent de la Maine et de la Loire, Bouchemaine profite elle aussi de notre service de nettoyage automobile premium, avec un rendez-vous pris directement à votre domicile.",
  },
  {
    slug: 'saint-barthelemy-danjou',
    name: "Saint-Barthélemy-d'Anjou",
    distanceKm: 4,
    intro:
      "Commune limitrophe d'Angers à l'est, Saint-Barthélemy-d'Anjou fait partie du cœur de notre zone d'intervention pour les prestations de rénovation esthétique automobile.",
  },
  {
    slug: 'verrieres-en-anjou',
    name: 'Verrières-en-Anjou',
    distanceKm: 10,
    intro:
      "Au nord-est de l'agglomération angevine, Verrières-en-Anjou (Saint-Sylvain-d'Anjou, Pellouailles-les-Vignes) bénéficie de nos prestations de detailing automobile haut de gamme, sur rendez-vous.",
  },
  {
    slug: 'beaucouze',
    name: 'Beaucouzé',
    distanceKm: 6,
    intro:
      "À l'ouest d'Angers, Beaucouzé et son pôle d'activité font partie de notre secteur d'intervention pour l'entretien esthétique de véhicules particuliers et utilitaires.",
  },
  {
    slug: 'murs-erigne',
    name: 'Mûrs-Érigné',
    distanceKm: 12,
    intro:
      "Au sud de l'agglomération, entre Loire et Layon, Mûrs-Érigné fait partie des communes que nous desservons pour un nettoyage automobile complet, à domicile.",
  },
  {
    slug: 'montreuil-juigne',
    name: 'Montreuil-Juigné',
    distanceKm: 10,
    intro:
      "Au nord d'Angers, sur les bords de Mayenne, Montreuil-Juigné bénéficie de notre service de detailing automobile itinérant, pour un véhicule impeccable sans quitter votre secteur.",
  },
  {
    slug: 'ecouflant',
    name: 'Écouflant',
    distanceKm: 8,
    intro:
      "Aux portes nord d'Angers, le long de la Maine, Écouflant fait partie de notre zone de déplacement habituelle pour les prestations de nettoyage et de rénovation automobile.",
  },
  {
    slug: 'sainte-gemmes-sur-loire',
    name: 'Sainte-Gemmes-sur-Loire',
    distanceKm: 8,
    intro:
      "Au sud d'Angers, en bord de Loire, Sainte-Gemmes-sur-Loire est couverte par notre service de detailing automobile premium à domicile.",
  },
]

export function getCity(slug) {
  return CITIES.find((c) => c.slug === slug)
}
