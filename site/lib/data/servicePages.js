// Pages dédiées /prestations/[service] — source unique pour le hub /prestations,
// le footer, les pages ville et les articles de blog qui pointent vers elles.
// Tous les prix cités viennent de lib/data/pricing.js et lib/data/services.js :
// aucun chiffre n'est inventé ou dupliqué ici.

export const SERVICE_PAGES = [
  {
    slug: 'nettoyage-interieur-voiture',
    name: 'Nettoyage intérieur voiture',
    h1: 'Nettoyage intérieur voiture à Angers',
    metaTitle: 'Nettoyage intérieur voiture à Angers',
    metaDescription:
      'Nettoyage intérieur de voiture à domicile à Angers : aspiration, plastiques, tapis, désodorisation. Dès 109 €. Devis rapide, intervention chez vous.',
    directAnswer:
      "Le nettoyage intérieur de votre voiture à domicile à Angers est accessible dès 109 € avec notre formule Coup de Propre, et dès 179 € pour une remise en état complète (Sortie de Concession). Devis en quelques minutes, intervention chez vous ou sur votre lieu de travail.",
    icon: 'IconDroplet',
    priceLine: 'dès 109 €',
    fromPrice: 109,
    content: [
      { type: 'p', text: "Un habitacle propre change tout le ressenti au volant — et c'est souvent la prestation la plus demandée par nos clients à Angers et dans toute l'agglomération. Nous proposons deux niveaux d'intervention, selon l'état de votre véhicule et vos besoins." },
      { type: 'h2', text: 'Ce que comprend un nettoyage intérieur' },
      { type: 'p', text: "Notre formule [Coup de Propre](/prestations#formules), à partir de 109 €, comprend l'aspiration complète de l'habitacle et du coffre, le dépoussiérage du tableau de bord et des contre-portes, le nettoyage des vitres intérieures, des tapis et moquettes, ainsi qu'une désodorisation. C'est l'entretien régulier idéal entre deux nettoyages plus poussés." },
      { type: 'p', text: "Pour un intérieur qui ressort comme neuf, notre formule Sortie de Concession (à partir de 179 €) ajoute le nettoyage en profondeur et le dressing UV de tous les plastiques, le shampouinage des tapis, et un passage minutieux dans les moindres recoins — rails de sièges, aérateurs, contre-portes." },
      { type: 'h2', text: 'Des prestations ciblées, sur devis' },
      { type: 'p', text: "Pour une tache isolée ou une sellerie en cuir, nous proposons aussi des interventions ciblées : nettoyage textile ciblé ou complet, [traitement cuir](/conseils/entretenir-interieur-cuir-bons-gestes) nourrissant et protecteur, ou nettoyage approfondi du coffre. Le tarif exact de chaque prestation complémentaire figure sur notre page [Prestations & tarifs](/prestations)." },
      { type: 'p', text: "Une odeur tenace (tabac, humidité, animal) ne part pas toujours avec un simple nettoyage : dans ce cas, nous recommandons d'associer notre [désinfection à l'ozone](/prestations/desinfection-ozone), qui traite la source de l'odeur plutôt que de la masquer." },
      { type: 'h2', text: 'Comment se déroule l’intervention ?' },
      { type: 'p', text: "Vous décrivez votre véhicule et son état lors du devis, nous convenons d'un créneau, puis nous intervenons directement chez vous ou sur votre lieu de travail à Angers et dans un rayon de 30 km — il suffit d'un accès à l'eau et à l'électricité. Comptez entre 2h et 6h selon la formule choisie." },
    ],
    faq: [
      {
        question: 'Combien coûte un nettoyage intérieur de voiture à Angers ?',
        answer: "À partir de 109 € pour la formule Coup de Propre (aspiration, plastiques, vitres, tapis, désodorisation), et à partir de 179 € pour la formule Sortie de Concession, plus complète. Le tarif précis dépend du gabarit de votre véhicule et de son état, confirmé lors du devis.",
      },
      {
        question: 'Combien de temps dure un nettoyage intérieur complet ?',
        answer: "Comptez 2h à 3h pour un Coup de Propre, et 4h à 6h pour une Sortie de Concession, qui inclut un travail plus minutieux (dressing UV, shampouinage des tapis, recoins difficiles d'accès).",
      },
      {
        question: 'Travaillez-vous sur les selleries cuir ?',
        answer: "Oui, nous proposons un traitement cuir dédié (nettoyage, nourrissage, protection) à partir de 60 €, pensé pour préserver la souplesse du cuir et éviter le craquellement. Voir aussi nos conseils pour [entretenir un intérieur cuir](/conseils/entretenir-interieur-cuir-bons-gestes).",
      },
    ],
    relatedServices: ['lavage-exterieur-domicile', 'desinfection-ozone'],
    relatedArticles: ['entretenir-interieur-cuir-bons-gestes', 'enlever-tache-siege-tissu-voiture'],
  },
  {
    slug: 'lavage-exterieur-domicile',
    name: 'Lavage extérieur à domicile',
    h1: 'Lavage extérieur de voiture à domicile à Angers',
    metaTitle: 'Lavage extérieur de voiture à domicile à Angers',
    metaDescription:
      'Lavage extérieur de voiture à domicile à Angers, sans risque de micro-rayure. Dès 45 €. Prélavage, lavage manuel, jantes, séchage. Devis rapide.',
    directAnswer:
      "Le lavage extérieur de votre voiture à domicile à Angers est accessible dès 45 €, en deux phases (prélavage puis lavage manuel) pour éviter tout risque de micro-rayure. Nous intervenons directement chez vous, sur votre lieu de travail ou en entreprise.",
    icon: 'IconDroplet',
    priceLine: 'dès 45 €',
    fromPrice: 45,
    content: [
      { type: 'p', text: "Contrairement à une station de lavage automatique, notre lavage extérieur se fait entièrement à la main, en deux phases, pour retirer les salissures sans jamais marquer la carrosserie. Voir notre comparatif [lavage à domicile vs station de lavage](/conseils/nettoyage-domicile-vs-station-lavage) pour comprendre la différence." },
      { type: 'h2', text: 'Trois niveaux de lavage extérieur' },
      { type: 'p', text: "Le lavage extérieur classique, à partir de 45 €, comprend le prélavage, le lavage manuel, le nettoyage des jantes, le rinçage, le séchage et les finitions. Le lavage extérieur approfondi, à partir de 70 €, y ajoute un passage des roues plus poussé et une décontamination légère. Pour une carrosserie très encrassée (goudron, projections ferreuses), la décontamination complète, à partir de 100 €, associe lavage approfondi et décontamination chimique et mécanique." },
      { type: 'h2', text: 'Quand choisir quel niveau ?' },
      { type: 'p', text: "Un lavage classique suffit pour un entretien régulier. Si votre carrosserie est rugueuse au toucher malgré un lavage récent, ou qu'elle a traversé l'hiver avec beaucoup de sel et de projections routières, la décontamination complète est recommandée avant tout [lustrage ou polissage](/prestations/lustrage-polissage) : c'est elle qui retire ce qu'un simple lavage ne peut pas enlever." },
      { type: 'p', text: "Le lavage extérieur est aussi systématiquement offert dans notre formule [Sortie de Concession](/prestations/nettoyage-interieur-voiture), pour un véhicule intégralement remis à neuf, intérieur comme extérieur." },
    ],
    faq: [
      {
        question: 'Le lavage à la main abîme-t-il moins la peinture qu’une station de lavage ?',
        answer: "Oui, c'est tout l'intérêt : un lavage en deux phases (prélavage puis lavage manuel avec des gants et seaux dédiés) limite fortement le risque de micro-rayures, contrairement à certains portiques automatiques dont les brosses accumulent les particules abrasives d'un véhicule à l'autre.",
      },
      {
        question: 'Avez-vous besoin d’un accès à l’eau chez moi ?',
        answer: "Nous venons avec notre propre matériel et notre réserve d'eau : un accès à l'eau de votre domicile n'est pas indispensable, mais reste un plus. Un accès à l'électricité est en revanche nécessaire pour certaines prestations.",
      },
      {
        question: 'Proposez-vous le lavage extérieur en entreprise, pour une flotte ?',
        answer: "Oui, nous intervenons aussi bien chez les particuliers qu'en entreprise. Pour une flotte de véhicules, consultez notre espace Pro, avec facturation groupée et tarifs dégressifs.",
      },
    ],
    relatedServices: ['nettoyage-interieur-voiture', 'lustrage-polissage'],
    relatedArticles: ['nettoyage-domicile-vs-station-lavage', 'preparer-voiture-hiver'],
  },
  {
    slug: 'lustrage-polissage',
    name: 'Lustrage et polissage',
    h1: 'Lustrage et polissage de carrosserie à Angers',
    metaTitle: 'Lustrage et polissage de carrosserie à Angers',
    metaDescription:
      'Lustrage et polissage de carrosserie à domicile à Angers. Lustrage minute dès 59 €, lustrage classique dès 150 €, polissage dès 350 €. Devis gratuit.',
    directAnswer:
      "Le lustrage et le polissage de votre carrosserie à Angers sont accessibles dès 59 € pour un lustrage minute, et dès 350 € pour une correction par polissage. La prestation la plus adaptée dépend de l'état réel de votre peinture — nous vous conseillons lors du devis.",
    icon: 'IconSparkle',
    priceLine: 'dès 59 €',
    fromPrice: 59,
    content: [
      { type: 'p', text: "Polissage et lustrage sont souvent confondus, alors qu'ils répondent à des besoins différents : l'un corrige la peinture, l'autre sublime sa brillance sans l'abraser. Le détail complet est dans notre article [polissage ou lustrage, quelle différence ?](/conseils/polissage-ou-lustrage-quelle-difference)" },
      { type: 'h2', text: 'Nos prestations de brillance' },
      { type: 'ul', items: [
        "**Lustrage minute**, à partir de 59 € : notre prestation phare, une finition brillance express qui ravive la peinture sans les heures d'un lustrage complet.",
        "**Lustrage classique**, à partir de 150 € : une finition non abrasive plus poussée, qui ravive l'éclat et comble légèrement les micro-défauts. Le lavage extérieur est inclus, condition technique pour un résultat optimal.",
        "**Polissage (correction avancée)**, à partir de 350 € : une opération de correction qui retire une fine couche de vernis pour effacer micro-rayures, hologrammes et traces d'oxydation.",
      ] },
      { type: 'h2', text: 'Quelle prestation pour votre véhicule ?' },
      { type: 'p', text: "Si votre carrosserie est simplement un peu terne mais sans défaut marqué, un lustrage suffit généralement. Si vous voyez des micro-rayures au soleil ou des hologrammes en toile d'araignée sous certains angles, un polissage est nécessaire avant toute finition. Dans le doute, nous examinons votre véhicule lors du devis et vous orientons vers la prestation réellement utile." },
      { type: 'p', text: "Le lustrage et le polissage sont aussi la préparation indispensable avant un [traitement céramique](/prestations/traitement-ceramique) : la protection se fige sur l'état actuel de la peinture, mieux vaut donc corriger les défauts avant de protéger." },
    ],
    faq: [
      {
        question: 'Quelle est la différence entre polissage et lustrage ?',
        answer: "Le polissage corrige la peinture en retirant une fine couche de vernis (micro-rayures, hologrammes). Le lustrage est une finition non abrasive qui ravive la brillance sans corriger. Détail complet dans notre article [polissage ou lustrage](/conseils/polissage-ou-lustrage-quelle-difference).",
      },
      {
        question: 'Le lustrage minute convient-il avant une revente ?',
        answer: "Oui, c'est l'une des prestations les plus demandées avant une vente : rapide, abordable (dès 59 €), elle redonne un aspect soigné à la carrosserie sans l'investissement d'un polissage complet. Voir aussi nos conseils pour [préparer sa voiture avant une revente](/conseils/preparer-voiture-revente).",
      },
      {
        question: 'Combien de temps dure l’effet d’un polissage ou d’un lustrage ?',
        answer: "Sans protection complémentaire, l'effet s'estompe progressivement avec les lavages et l'exposition aux UV, en général après quelques mois. Pour une protection qui dure plusieurs années, associez votre polissage à un traitement céramique.",
      },
    ],
    relatedServices: ['traitement-ceramique', 'lavage-exterieur-domicile'],
    relatedArticles: ['polissage-ou-lustrage-quelle-difference'],
  },
  {
    slug: 'traitement-ceramique',
    name: 'Traitement céramique',
    h1: 'Traitement céramique voiture à Angers',
    metaTitle: 'Traitement céramique voiture à Angers',
    metaDescription:
      'Traitement céramique pour voiture à Angers : protection longue durée, brillance et facilité d’entretien. Sur devis après inspection. Devis gratuit.',
    directAnswer:
      "Le traitement céramique protège durablement la carrosserie de votre véhicule contre les UV et les salissures, à Angers et alentours. La prestation est systématiquement établie sur devis après inspection, car elle dépend de l'état de préparation nécessaire.",
    icon: 'IconShield',
    priceLine: 'sur devis',
    fromPrice: null,
    content: [
      { type: 'p', text: "Longtemps réservé aux véhicules de collection ou de compétition, le traitement céramique s'est largement démocratisé. Il consiste à appliquer une résine à base de silice qui se lie chimiquement au vernis, pour une protection dure, hydrophobe et résistante bien supérieure à une cire classique." },
      { type: 'h2', text: 'Pourquoi protéger sa peinture avec de la céramique ?' },
      { type: 'p', text: "Une fois appliqué, l'eau, la poussière et la plupart des salissures ne s'accrochent plus de la même façon : elles glissent sur la carrosserie au lieu de s'y incruster. Le lavage devient plus rapide et plus simple, et la peinture reste protégée des agressions UV, l'une des premières causes de ternissement dans le temps. Le détail complet est dans notre article [traitement céramique : pourquoi et comment](/conseils/traitement-ceramique-pourquoi-comment)." },
      { type: 'h2', text: 'Une préparation indispensable avant application' },
      { type: 'p', text: "Un traitement céramique appliqué sur une peinture non préparée fige tous les défauts existants sous la couche de protection. C'est pourquoi nous ne l'appliquons jamais sans une étape de [décontamination](/prestations/lavage-exterieur-domicile), et de [polissage](/prestations/lustrage-polissage) si l'état de la carrosserie le justifie. C'est cette préparation, propre à chaque véhicule, qui explique que le tarif soit toujours établi sur devis après inspection." },
      { type: 'h2', text: 'Combien de temps dure la protection ?' },
      { type: 'p', text: "Selon l'entretien et l'utilisation du véhicule, la protection dure généralement entre 3 et 5 ans. Nous évaluons la durée adaptée à votre usage lors du devis, et vous conseillons sur l'entretien à adopter pour en prolonger les effets." },
    ],
    faq: [
      {
        question: 'Combien coûte un traitement céramique ?',
        answer: "Le tarif est systématiquement établi sur devis, après inspection du véhicule : il dépend de l'état de la peinture et donc du travail de préparation nécessaire (décontamination, polissage éventuel) avant l'application elle-même.",
      },
      {
        question: 'Combien de temps dure un traitement céramique ?',
        answer: "Entre 3 et 5 ans selon l'entretien et l'utilisation du véhicule (conditions d'exposition, kilométrage, fréquence des lavages). Nous évaluons la durée adaptée à votre usage lors du devis.",
      },
      {
        question: 'Faut-il polir la voiture avant un traitement céramique ?',
        answer: "Si la carrosserie présente des défauts (micro-rayures, hologrammes), oui : la céramique fige l'état actuel de la peinture sous la protection. Nous évaluons ce besoin lors de l'inspection, sans vous faire payer une étape inutile.",
      },
    ],
    relatedServices: ['lustrage-polissage', 'lavage-exterieur-domicile'],
    relatedArticles: ['traitement-ceramique-pourquoi-comment', 'traitement-ceramique-vs-cire'],
  },
  {
    slug: 'nettoyage-moto',
    name: 'Nettoyage moto',
    h1: 'Nettoyage et detailing moto à Angers',
    metaTitle: 'Nettoyage et detailing moto à Angers',
    metaDescription:
      'Nettoyage et detailing moto à domicile à Angers : lavage, décontamination, lustrage, protection. Dès 65 €. Devis rapide, intervention à domicile.',
    directAnswer:
      "Le nettoyage et detailing de votre moto ou scooter à Angers est accessible dès 65 €. Nettoyage complet, décontamination, lustrage de la carrosserie, des pièces chromées et carbone, directement à domicile.",
    icon: 'IconMoto',
    priceLine: 'dès 65 €',
    fromPrice: 65,
    content: [
      { type: 'p', text: "De la citadine électrique au roadster de caractère, chaque moto reçoit le même soin méticuleux que nos voitures. C'est une exclusivité de notre espace Particuliers, pensée pour les passionnés comme pour un usage quotidien." },
      { type: 'h2', text: 'Ce que comprend notre prestation moto' },
      { type: 'p', text: "Nettoyage minutieux jusqu'au moindre recoin, décontamination de la carrosserie, lustrage de la peinture, des pièces chromées et des éléments carbone (échappement, caches), et protection longue durée pour limiter les futurs dépôts. Le tarif, à partir de 65 €, varie ensuite selon le modèle et son état — confirmé lors du devis." },
      { type: 'h2', text: 'Pourquoi un entretien régulier change tout sur une moto' },
      { type: 'p', text: "Une moto est plus exposée qu'une voiture aux projections, à la pluie et aux variations de température : chrome, carbone et peinture s'encrassent vite, et les pièces techniques (chaîne, fourche) méritent une attention particulière lors du nettoyage pour ne pas être agressées par les produits. Nous adaptons systématiquement nos méthodes à chaque matière présente sur votre moto." },
      { type: 'p', text: "Comme pour nos prestations auto, l'intervention se fait directement à domicile, à Angers et dans un rayon de 30 km, avec notre propre matériel." },
    ],
    faq: [
      {
        question: 'Le nettoyage moto se fait-il à domicile ?',
        answer: "Oui, exactement comme pour nos prestations auto : nous intervenons directement chez vous ou sur votre lieu de travail, à Angers et dans un rayon de 30 km, avec tout le matériel nécessaire.",
      },
      {
        question: 'Travaillez-vous sur les pièces carbone et chromées ?',
        answer: "Oui, le lustrage des pièces chromées et des éléments carbone (échappement, caches) fait partie intégrante de notre prestation moto, avec des produits et méthodes adaptés à chaque matière pour ne pas les abîmer.",
      },
      {
        question: 'Proposez-vous aussi le nettoyage moto aux professionnels ?',
        answer: "La prestation moto est une exclusivité de notre espace Particuliers. Pour une flotte de véhicules professionnels (utilitaires, poids lourds, engins), consultez notre espace Pro.",
      },
    ],
    relatedServices: ['lustrage-polissage', 'nettoyage-interieur-voiture'],
    relatedArticles: ['polissage-ou-lustrage-quelle-difference'],
  },
  {
    slug: 'renovation-optiques',
    name: 'Rénovation optiques',
    h1: 'Rénovation des phares à Angers',
    metaTitle: 'Rénovation des phares à Angers',
    metaDescription:
      'Rénovation de phares jaunis ou ternes à Angers. Ponçage et polissage des optiques, dès 80 € la paire. Devis rapide, intervention à domicile.',
    directAnswer:
      "La rénovation de vos optiques jaunies ou ternes à Angers est accessible dès 80 € la paire. Ponçage et polissage pour retrouver transparence et sécurité d'éclairage, directement à domicile.",
    icon: 'IconEye',
    priceLine: 'dès 80 €',
    fromPrice: 80,
    content: [
      { type: 'p', text: "Avec le temps et l'exposition aux UV, les optiques en plastique se ternissent et jaunissent : au-delà de l'esthétique, cela réduit réellement la puissance d'éclairage de vos phares, un enjeu de sécurité trop souvent sous-estimé." },
      { type: 'h2', text: 'Trois niveaux de rénovation, selon l’état des optiques' },
      { type: 'p', text: "Notre rénovation optiques se décline en trois niveaux selon le degré de jaunissement ou de ternissure : léger (à partir de 80 € la paire), intermédiaire (à partir de 100 €) et important (à partir de 120 €). Le ponçage progressif puis le polissage retirent la couche oxydée et redonnent une transparence proche du neuf." },
      { type: 'h2', text: 'Pourquoi ne pas attendre' },
      { type: 'p', text: "Plus les optiques sont jaunies, plus le niveau de ponçage nécessaire est important. Agir tôt permet souvent de rester sur une rénovation légère, moins coûteuse et plus rapide. C'est aussi un point que les acheteurs regardent de près : des phares clairs font partie des petits détails qui comptent au moment de [préparer sa voiture pour la revente](/conseils/preparer-voiture-revente)." },
      { type: 'p', text: "La rénovation optiques se combine naturellement avec un [lustrage ou un polissage](/prestations/lustrage-polissage) de la carrosserie, pour un véhicule qui retrouve son éclat dans son ensemble." },
    ],
    faq: [
      {
        question: 'Combien coûte une rénovation de phares à Angers ?',
        answer: "À partir de 80 € la paire pour un jaunissement léger, 100 € pour un état intermédiaire, et 120 € pour un jaunissement important. Le niveau exact est évalué lors du devis, à partir de l'état réel de vos optiques.",
      },
      {
        question: 'La rénovation est-elle durable ?',
        answer: "Le ponçage et le polissage retirent la couche de plastique oxydée en surface. Pour prolonger le résultat, une protection UV peut être appliquée en complément — nous vous conseillons au cas par cas lors du devis.",
      },
      {
        question: 'Des phares jaunis sont-ils vraiment un problème de sécurité ?',
        answer: "Oui : un plastique oxydé diffuse la lumière au lieu de la projeter nettement, ce qui réduit la portée et la précision de l'éclairage de nuit. C'est un point de contrôle technique régulièrement signalé.",
      },
    ],
    relatedServices: ['lustrage-polissage', 'nettoyage-interieur-voiture'],
    relatedArticles: ['preparer-voiture-revente'],
  },
  {
    slug: 'desinfection-ozone',
    name: 'Désinfection à l’ozone',
    h1: 'Désinfection à l’ozone de voiture à Angers',
    metaTitle: 'Désinfection à l’ozone de voiture à Angers',
    metaDescription:
      'Désinfection à l’ozone de voiture à Angers : élimine bactéries, acariens, moisissures et odeurs (tabac, animaux). Dès 59 €. Devis rapide.',
    directAnswer:
      "La désinfection à l'ozone de votre voiture à Angers est accessible dès 59 €. Elle élimine bactéries, acariens, moisissures et odeurs incrustées (tabac, animaux, humidité) là où un nettoyage classique ne suffit pas.",
    icon: 'IconLeaf',
    priceLine: 'dès 59 €',
    fromPrice: 59,
    content: [
      { type: 'p', text: "Contrairement à un désodorisant qui masque temporairement une odeur, l'ozone s'attaque directement à sa source. C'est un traitement complémentaire à un nettoyage intérieur, particulièrement recommandé après l'achat d'un véhicule d'occasion ou en cas d'odeur tenace." },
      { type: 'h2', text: 'Ce que fait réellement l’ozone' },
      { type: 'p', text: "L'ozone est un gaz oxydant naturellement instable qui pénètre partout où l'air circule : tissus, mousses des sièges, moquettes, mais aussi le circuit de ventilation et de climatisation, souvent le grand oublié du nettoyage automobile. En se décomposant, il neutralise bactéries, moisissures, acariens et les molécules responsables des odeurs, sans laisser de résidu chimique ni de parfum masquant. Détail complet dans notre article [pourquoi une désinfection à l'ozone change tout sur une occasion](/conseils/voiture-occasion-desinfection-ozone)." },
      { type: 'h2', text: 'Dans quels cas la recommander ?' },
      { type: 'p', text: "Odeur de tabac incrustée, odeur d'animal, humidité après une fuite ou un oubli de vitre ouverte, achat d'un véhicule d'occasion dont vous ne connaissez pas l'historique d'entretien : dans tous ces cas, un nettoyage classique ne suffit généralement pas à éliminer la source. Voir aussi notre article [comment enlever une mauvaise odeur dans une voiture](/conseils/enlever-mauvaise-odeur-voiture)." },
      { type: 'p', text: "Le traitement est sans danger pour l'habitacle une fois le véhicule aéré, et s'associe idéalement à un [nettoyage intérieur complet](/prestations/nettoyage-interieur-voiture) pour traiter à la fois la saleté visible et ce qu'on ne voit pas." },
    ],
    faq: [
      {
        question: 'À quoi sert la désinfection à l’ozone ?',
        answer: "L'ozone est un gaz oxydant qui pénètre dans les tissus, moquettes et gaines de ventilation pour éliminer bactéries, acariens, moisissures et odeurs incrustées (tabac, animaux, humidité) là où un simple nettoyage ne suffit pas.",
      },
      {
        question: 'Le traitement est-il dangereux ?',
        answer: "Non, une fois le véhicule correctement aéré après le traitement. L'ozone se décompose naturellement en oxygène et ne laisse aucun résidu chimique dans l'habitacle.",
      },
      {
        question: 'Faut-il le faire systématiquement après l’achat d’une occasion ?',
        answer: "Nous le recommandons systématiquement après l'achat d'un véhicule d'occasion, en complément d'un nettoyage intérieur complet, car on ignore généralement ce que les précédents trajets et propriétaires ont laissé dans les tissus et la ventilation.",
      },
    ],
    relatedServices: ['nettoyage-interieur-voiture', 'nettoyage-canape-matelas'],
    relatedArticles: ['voiture-occasion-desinfection-ozone', 'enlever-mauvaise-odeur-voiture'],
  },
  {
    slug: 'nettoyage-canape-matelas',
    name: 'Nettoyage canapé et matelas',
    h1: 'Nettoyage de canapé et matelas à Angers',
    metaTitle: 'Nettoyage de canapé et matelas à Angers',
    metaDescription:
      'Nettoyage professionnel de canapé et matelas à domicile à Angers : taches, odeurs, shampouinage textile. Sur devis. Devis rapide et gratuit.',
    directAnswer:
      "Le nettoyage professionnel de votre canapé ou matelas à domicile à Angers est établi sur devis, selon la taille, la matière et l'état du textile. Taches incrustées, odeurs, shampouinage complet : nous traitons vos textiles d'intérieur avec le même soin que nos selleries automobiles.",
    icon: 'IconStar',
    priceLine: 'sur devis',
    fromPrice: null,
    content: [
      { type: 'p', text: "Fort de notre expertise sur les selleries automobiles, nous appliquons les mêmes méthodes professionnelles à vos textiles d'intérieur : canapés, matelas, fauteuils. Une prestation que plusieurs de nos clients ont découverte après nous avoir fait confiance pour leur véhicule, et qu'ils recommandent tout autant." },
      { type: 'h2', text: 'Taches, odeurs et shampouinage en profondeur' },
      { type: 'p', text: "Nous intervenons sur les taches incrustées — vin, urine, graisse — comme sur un entretien de fond : shampouinage textile en profondeur, extraction de la saleté logée dans les fibres, et désodorisation si nécessaire. Chaque matière (tissu, microfibre, certains cuirs) demande une méthode et des produits adaptés, évalués lors du devis." },
      { type: 'h2', text: 'Un devis adapté à chaque textile' },
      { type: 'p', text: "La taille du canapé ou du matelas, le type de tissu et l'ampleur des taches à traiter font varier le temps d'intervention et donc le tarif : cette prestation est systématiquement établie sur devis, sans mauvaise surprise le jour de l'intervention." },
      { type: 'p', text: "Comme pour nos prestations automobiles, nous nous déplaçons directement chez vous, à Angers et dans un rayon de 30 km." },
    ],
    faq: [
      {
        question: 'Nettoyez-vous vraiment les canapés et matelas, pas seulement les voitures ?',
        answer: "Oui, c'est une prestation à part entière, réalisée avec les mêmes méthodes professionnelles que pour nos selleries automobiles. Plusieurs de nos avis clients en parlent directement.",
      },
      {
        question: 'Pouvez-vous enlever une tache ancienne, déjà sèche ?',
        answer: "Dans la majorité des cas, oui : notre méthode d'extraction en profondeur permet de traiter des taches incrustées depuis un moment. Le résultat dépend toutefois de la nature de la tache et du textile — nous restons honnêtes sur ce point lors du devis.",
      },
      {
        question: 'Combien coûte le nettoyage d’un canapé ou d’un matelas ?',
        answer: "Le tarif est établi sur devis, selon la taille, la matière et l'état du textile à traiter. Contactez-nous avec quelques précisions (type de canapé/matelas, taches à traiter) pour recevoir une estimation rapide.",
      },
    ],
    relatedServices: ['nettoyage-interieur-voiture', 'desinfection-ozone'],
    relatedArticles: ['enlever-tache-siege-tissu-voiture'],
  },
]

export function getServicePage(slug) {
  return SERVICE_PAGES.find((s) => s.slug === slug)
}
