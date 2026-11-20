// Pages « prestation + commune » (ex. /prestations/nettoyage-interieur-voiture/trelaze),
// sur le modèle des sites concurrents les mieux classés. Chaque page a un texte
// et une FAQ propres : jamais une simple copie de la page prestation ou de la
// page commune, pour ne pas se concurrencer soi-même sur Google.
// VERSION TEST : 2 pages, à valider avant de les mettre en ligne ou d'en ajouter.

export const SERVICE_CITY_PAGES = [
  {
    service: "nettoyage-interieur-voiture",
    city: "trelaze",
    lead: "Nettoyage intérieur de votre voiture à Trélazé, devant chez vous ou sur le parking de votre entreprise : aspiration complète, plastiques, vitres, tapis et désodorisation, sans frais de déplacement.",
    paragraphs: [
      "Trélazé est à 7 km d'Angers : c'est l'une des communes où Enzo intervient le plus souvent, du centre-ville à Grand-Bellevue, en passant par La Quantinière, Malaquais et le secteur des Ardoisières.",
      "Vous travaillez dans une zone d'activité le long de la D323 ? Donnez-nous rendez-vous sur le parking : votre voiture est nettoyée pendant votre journée, vous la récupérez propre le soir.",
      "Pour un entretien courant, la formule Coup de Propre suffit. Pour une voiture familiale très utilisée, des sièges tachés ou une voiture d'occasion à remettre à neuf, choisissez la Sortie de Concession : plastiques en profondeur avec dressing UV, shampouinage des tapis et tous les recoins.",
    ],
    faq: [
      {
        question:
          "Quel est le prix d’un nettoyage intérieur de voiture à Trélazé ?",
        answer:
          "Le même qu'à Angers, déplacement compris : à partir de 109 € pour le Coup de Propre et de 179 € pour la Sortie de Concession, selon le gabarit du véhicule. Le prix exact est confirmé au devis.",
      },
      {
        question: "Combien de temps faut-il prévoir ?",
        answer:
          "Comptez 2 h à 3 h pour un Coup de Propre et 4 h à 6 h pour une Sortie de Concession. Vous n’avez pas besoin de rester à côté de la voiture pendant l’intervention.",
      },
      {
        question: "Que faut-il prévoir sur place à Trélazé ?",
        answer:
          "Un emplacement accessible pour garer la voiture et, selon la prestation, un point d'eau et d'électricité à proximité. Pensez simplement à vider la voiture de vos effets personnels avant notre arrivée.",
      },
      {
        question: "Mes enfants ont taché les sièges : est-ce que ça part ?",
        answer:
          "Dans la grande majorité des cas, oui. Le nettoyage textile des sièges et le shampouinage des tapis viennent à bout des taches de boisson, de chocolat ou de boue. Envoyez une photo avec votre demande de devis pour un avis plus précis.",
      },
    ],
  },
  {
    service: "nettoyage-interieur-voiture",
    city: "avrille",
    lead: "Nettoyage intérieur de voiture à domicile à Avrillé : habitacle aspiré, plastiques, vitres et tapis nettoyés chez vous, le week-end ou sur votre lieu de travail en semaine.",
    paragraphs: [
      "Avrillé est à 5 km d'Angers. Nous intervenons dans toute la commune, du centre-ville au Plateau de la Mayenne et au Bois du Roy, sans supplément.",
      "Vous venez d'acheter une voiture d'occasion dans l'un des garages de la commune ? C'est le bon moment pour une Sortie de Concession : on repart d'un habitacle remis à neuf, sans les traces de l'ancien propriétaire.",
      "Une odeur de tabac, d'animal ou d'humidité persiste ? On peut ajouter une désinfection à l'ozone au nettoyage intérieur, pour traiter l'odeur à la source plutôt que de la masquer.",
    ],
    faq: [
      {
        question: "Combien coûte un nettoyage intérieur de voiture à Avrillé ?",
        answer:
          "À partir de 109 € pour un Coup de Propre et 179 € pour une Sortie de Concession, déplacement inclus. Le tarif dépend du gabarit (citadine, berline, SUV) et de l’état du véhicule, et il est fixé au devis avant toute intervention.",
      },
      {
        question: "Quelle formule choisir pour une voiture d’occasion ?",
        answer:
          "La Sortie de Concession : nettoyage en profondeur des plastiques avec dressing UV, shampouinage des tapis et passage dans tous les recoins. Si une odeur reste, ajoutez une désinfection à l'ozone.",
      },
      {
        question: "Pouvez-vous venir chez moi le week-end à Avrillé ?",
        answer:
          "Nous adaptons les créneaux selon nos disponibilités : à domicile le week-end, ou au travail en journée. Indiquez vos préférences dans la demande de devis.",
      },
      {
        question: "Nettoyez-vous les sièges en cuir ?",
        answer:
          "Oui, avec un traitement cuir dédié (nettoyage, nourrissage, protection) à partir de 60 €, qui garde le cuir souple et évite qu’il craquelle.",
      },
    ],
  },
];

export function getServiceCityPage(service, city) {
  return (
    SERVICE_CITY_PAGES.find((p) => p.service === service && p.city === city) ||
    null
  );
}

export function serviceCityHref(p) {
  return `/prestations/${p.service}/${p.city}`;
}
