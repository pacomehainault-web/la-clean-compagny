// Contenu local des pages /zone-intervention/[ville] (en plus de `intro` et
// `extra` dans lib/data/cities.js). Objectif : que chaque page commune soit une
// vraie page de référence pour « nettoyage voiture <commune> », et pas une
// fiche générique où seul le nom change.
//
// - `sectors` : secteurs/quartiers de la commune cités dans la page (lieux
//   réels et connus, rien d'inventé).
// - `faq` : questions propres à la commune (jamais recopiées d'une page à
//   l'autre). Complétées sur la page par 2 questions générales.
// - `focus` : prestations mises en avant en premier pour cette commune (slugs
//   de lib/data/servicePages.js), selon le profil de la commune.
//
// Tous les prix cités viennent des formules réelles (lib/data/pricing.js,
// lib/data/services.js) : Coup de Propre dès 109 €, Sortie de Concession dès
// 179 €, lavage extérieur dès 45 €, lustrage minute dès 59 €, phares dès 80 €,
// ozone dès 59 €.

export const CITY_CONTENT = {
  trelaze: {
    sectors: ['Centre-ville', 'Grand-Bellevue', 'La Quantinière', 'Malaquais', 'Secteur des Ardoisières'],
    focus: ['nettoyage-interieur-voiture', 'lavage-exterieur-domicile', 'desinfection-ozone'],
    faq: [
      {
        question: 'Combien coûte un nettoyage de voiture à domicile à Trélazé ?',
        answer:
          "Les mêmes tarifs qu'à Angers, sans frais de déplacement : à partir de 109 € pour un Coup de Propre (intérieur complet), 179 € pour une Sortie de Concession (remise à neuf de l'habitacle) et 45 € pour un lavage extérieur. Le prix exact dépend du gabarit et de l'état du véhicule, il est fixé au devis.",
      },
      {
        question: 'Pouvez-vous nettoyer ma voiture sur mon lieu de travail à Trélazé ?',
        answer:
          "Oui. Beaucoup de clients nous donnent rendez-vous sur le parking de leur entreprise, notamment dans les zones d'activité le long de la D323 : vous travaillez, nous nettoyons. Il suffit que l'emplacement soit accessible et, selon la prestation, d'avoir un point d'électricité à proximité.",
      },
      {
        question: 'Proposez-vous un entretien régulier à Trélazé ?',
        answer:
          "Oui, avec le Pass Entretien : 2 ou 4 passages programmés sur 12 mois, à partir de 299 € par an pour une citadine, avec réservation prioritaire, aucun supplément lié à l'état du véhicule et -10 % sur les prestations complémentaires.",
      },
      {
        question: 'Sous quel délai pouvez-vous venir à Trélazé ?',
        answer:
          "Nous répondons aux demandes de devis sous 24h ouvrées, et le rendez-vous est en général fixé dans la semaine. Trélazé est à un quart d'heure d'Angers : c'est l'une des communes où nous intervenons le plus facilement.",
      },
    ],
  },
  avrille: {
    sectors: ['Centre-ville', 'Plateau de la Mayenne', 'Bois du Roy'],
    focus: ['nettoyage-interieur-voiture', 'desinfection-ozone', 'lustrage-polissage'],
    faq: [
      {
        question: 'Combien coûte un nettoyage de voiture à domicile à Avrillé ?',
        answer:
          "Comptez à partir de 109 € pour un Coup de Propre et 179 € pour une Sortie de Concession, déplacement inclus. Pour l'extérieur, le lavage à domicile démarre à 45 € et le lustrage minute à 59 €. Le devis précise le prix final avant toute intervention.",
      },
      {
        question: "Je viens d'acheter une voiture d'occasion à Avrillé : quelle formule choisir ?",
        answer:
          "La Sortie de Concession est faite pour ce moment-là : habitacle remis à neuf, plastiques, tapis et recoins nettoyés en profondeur. Si le véhicule garde une odeur (tabac, animal, humidité), ajoutez une désinfection à l'ozone, à partir de 59 €, qui traite la source de l'odeur au lieu de la masquer.",
      },
      {
        question: 'Pouvez-vous venir le soir ou le week-end à Avrillé ?',
        answer:
          "Nous adaptons les créneaux à votre emploi du temps selon nos disponibilités : à domicile le week-end, ou sur votre lieu de travail en journée. Le plus simple est d'indiquer vos préférences dans la demande de devis.",
      },
      {
        question: 'Intervenez-vous dans tout Avrillé ?',
        answer:
          "Oui, du centre-ville au Plateau de la Mayenne en passant par le Bois du Roy : toute la commune est dans notre zone habituelle, à 5 km d'Angers, sans supplément.",
      },
    ],
  },
  'les-ponts-de-ce': {
    sectors: ['Centre / Île du Château', 'Saint-Aubin', 'Saint-Maurille', 'Sorges'],
    focus: ['lavage-exterieur-domicile', 'lustrage-polissage', 'traitement-ceramique'],
    faq: [
      {
        question: 'Combien coûte un nettoyage de voiture à domicile aux Ponts-de-Cé ?',
        answer:
          "À partir de 109 € pour un nettoyage intérieur complet (Coup de Propre), 179 € pour une Sortie de Concession et 45 € pour un lavage extérieur, déplacement compris. Le tarif final dépend du gabarit et de l'état du véhicule, et il est annoncé au devis.",
      },
      {
        question: 'Ma voiture dort dehors près de la Loire : que conseillez-vous ?',
        answer:
          "Un véhicule garé dehors toute l'année accumule pollution, sève et dépôts qui ternissent la peinture. Un lavage extérieur avec décontamination, puis un lustrage pour raviver la brillance, est un bon point de départ ; pour une protection durable, le traitement céramique (sur devis) limite l'accroche des salissures et facilite les lavages suivants.",
      },
      {
        question: 'Intervenez-vous des deux côtés de la Loire ?',
        answer:
          "Oui : centre et île du Château, Saint-Aubin, Saint-Maurille comme Sorges. Toute la commune est couverte de la même façon, à 7 km d'Angers, sans frais de déplacement.",
      },
      {
        question: "Faut-il un point d'eau ou d'électricité chez moi ?",
        answer:
          "Cela dépend de la prestation : un accès à l'électricité suffit le plus souvent pour l'intérieur, et nous apportons notre propre matériel. Nous vérifions ensemble les conditions d'accès au moment du devis pour organiser l'intervention sans surprise.",
      },
    ],
  },
  bouchemaine: {
    sectors: ['Le bourg', 'La Pointe', 'Pruniers'],
    focus: ['nettoyage-interieur-voiture', 'lustrage-polissage', 'nettoyage-canape-matelas'],
    faq: [
      {
        question: 'Combien coûte un nettoyage de voiture à domicile à Bouchemaine ?',
        answer:
          "Les tarifs sont les mêmes qu'à Angers : à partir de 109 € pour un Coup de Propre, 179 € pour une Sortie de Concession, 45 € pour un lavage extérieur. Bouchemaine est à 9 km d'Angers, dans notre zone habituelle : aucun frais de déplacement.",
      },
      {
        question: 'Venez-vous à La Pointe et à Pruniers ?',
        answer:
          "Oui, toute la commune est couverte : le bourg, La Pointe au bord de la Maine et le secteur de Pruniers. Indiquez simplement votre adresse dans la demande de devis.",
      },
      {
        question: "Combien de temps dure l'intervention ?",
        answer:
          "Comptez 2h à 3h pour un Coup de Propre et 4h à 6h pour une Sortie de Concession. Vous n'avez pas besoin de rester à côté : beaucoup de clients nous confient les clés et profitent de leur matinée.",
      },
      {
        question: 'Nettoyez-vous aussi les canapés et matelas à Bouchemaine ?',
        answer:
          "Oui. Nous nettoyons à domicile canapés, fauteuils, matelas et tapis, sur devis selon les dimensions et la matière. C'est pratique de grouper les deux le même jour : la voiture et le salon.",
      },
    ],
  },
  'saint-barthelemy-danjou': {
    sectors: ['Centre-bourg', 'Secteur de Pignerolle', 'Zones d’activité proches de la rocade'],
    focus: ['nettoyage-interieur-voiture', 'renovation-optiques', 'lavage-exterieur-domicile'],
    faq: [
      {
        question: "Combien coûte un nettoyage de voiture à domicile à Saint-Barthélemy-d'Anjou ?",
        answer:
          "À partir de 109 € pour un Coup de Propre, 179 € pour une Sortie de Concession et 45 € pour un lavage extérieur. Saint-Barthélemy-d'Anjou touche Angers : aucun supplément de déplacement, quelle que soit la prestation.",
      },
      {
        question: "Intervenez-vous en entreprise à Saint-Barthélemy-d'Anjou ?",
        answer:
          "Oui, sur un véhicule isolé comme sur une flotte, directement sur votre parking. Pour les professionnels, notre espace Pro propose une facturation groupée et des tarifs dégressifs selon le volume.",
      },
      {
        question: 'Mes phares sont jaunis : pouvez-vous les rénover sur place ?',
        answer:
          "Oui, la rénovation des optiques se fait chez vous, à partir de 80 € la paire. Les phares retrouvent leur transparence, ce qui améliore l'éclairage la nuit et l'aspect général de la voiture, et peut éviter une remarque au contrôle technique.",
      },
      {
        question: 'Sous quel délai pouvez-vous venir ?',
        answer:
          "Réponse au devis sous 24h ouvrées, rendez-vous en général dans la semaine. La commune est à 4 km d'Angers : nous pouvons souvent caler une intervention dans la foulée d'un rendez-vous voisin.",
      },
    ],
  },
  'verrieres-en-anjou': {
    sectors: ["Saint-Sylvain-d'Anjou", 'Pellouailles-les-Vignes'],
    focus: ['nettoyage-interieur-voiture', 'desinfection-ozone', 'lavage-exterieur-domicile'],
    faq: [
      {
        question: "Couvrez-vous Saint-Sylvain-d'Anjou et Pellouailles-les-Vignes ?",
        answer:
          "Oui, toute la commune nouvelle de Verrières-en-Anjou est couverte : Saint-Sylvain-d'Anjou comme Pellouailles-les-Vignes, sans distinction de secteur.",
      },
      {
        question: 'Y a-t-il des frais de déplacement à Verrières-en-Anjou ?',
        answer:
          "Non. Verrières-en-Anjou est à une dizaine de kilomètres d'Angers, dans notre rayon habituel de 30 km : les tarifs sont identiques à ceux d'Angers, à partir de 109 € pour un Coup de Propre et 179 € pour une Sortie de Concession.",
      },
      {
        question: 'Ma voiture sent le tabac ou le chien : que proposez-vous ?',
        answer:
          "Un nettoyage intérieur retire la saleté qui retient les odeurs, et la désinfection à l'ozone, à partir de 59 €, traite les odeurs incrustées dans les tissus et la ventilation. Les deux se font chez vous, le même jour.",
      },
      {
        question: 'Comment réserver ?',
        answer:
          "Faites votre demande de devis en ligne en quelques minutes (photos du véhicule bienvenues), ou appelez-nous. Nous confirmons le prix et le créneau sous 24h ouvrées.",
      },
    ],
  },
  beaucouze: {
    sectors: ['Centre-bourg', 'Pôle commercial de l’Atoll', "Zones d'activité de l'ouest angevin"],
    focus: ['nettoyage-interieur-voiture', 'lavage-exterieur-domicile', 'lustrage-polissage'],
    faq: [
      {
        question: 'Combien coûte un nettoyage de voiture à domicile à Beaucouzé ?',
        answer:
          "À partir de 109 € pour un Coup de Propre, 179 € pour une Sortie de Concession et 45 € pour un lavage extérieur, sans frais de déplacement : Beaucouzé est à 6 km d'Angers.",
      },
      {
        question: "Pouvez-vous nettoyer ma voiture sur le parking de mon entreprise à Beaucouzé ?",
        answer:
          "Oui, c'est même très fréquent dans les zones d'activité de Beaucouzé : vous gardez votre journée de travail, nous intervenons sur place. Il suffit d'un emplacement accessible et, selon la prestation, d'un point d'électricité.",
      },
      {
        question: 'Nettoyez-vous les utilitaires et les flottes ?',
        answer:
          "Oui : utilitaires, véhicules de service ou flotte complète. Notre espace Pro propose une facturation groupée et des tarifs dégressifs selon le nombre de véhicules.",
      },
      {
        question: 'Sous quel délai pouvez-vous intervenir ?',
        answer:
          "Nous répondons sous 24h ouvrées et fixons en général le rendez-vous dans la semaine. Pour une flotte, nous planifions les passages pour limiter l'immobilisation des véhicules.",
      },
    ],
  },
}

// Accroche courte de chaque prestation, réutilisée dans le bloc « Nos
// prestations à <commune> » (le nom de la commune est ajouté dans le titre).
export const SERVICE_CITY_PITCH = {
  'nettoyage-interieur-voiture':
    "Aspiration complète, plastiques, vitres, tapis et désodorisation (Coup de Propre), ou remise à neuf de l'habitacle (Sortie de Concession, dès 179 €).",
  'lavage-exterieur-domicile':
    'Prélavage, lavage manuel, jantes, rinçage et séchage, directement devant chez vous ou sur votre lieu de travail.',
  'lustrage-polissage':
    'Lustrage minute pour raviver la brillance, lustrage complet ou polissage pour effacer micro-rayures et hologrammes.',
  'traitement-ceramique':
    'Protection longue durée de la carrosserie : brillance, effet déperlant et lavages bien plus faciles.',
  'nettoyage-moto':
    'Nettoyage et detailing de votre moto à domicile, avec des produits adaptés aux pièces sensibles.',
  'renovation-optiques':
    'Phares jaunis ou opacifiés rendus transparents : meilleur éclairage et voiture qui paraît plus récente.',
  'desinfection-ozone':
    "Traitement des odeurs de tabac, d'animaux ou d'humidité à la source, sans les masquer sous un parfum.",
  'nettoyage-canape-matelas':
    'Canapés, fauteuils, matelas et tapis nettoyés en profondeur chez vous, sur devis.',
}

export function getCityContent(slug) {
  return CITY_CONTENT[slug] || null
}
