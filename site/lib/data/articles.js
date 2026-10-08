import { CURRENT_YEAR } from '@/lib/constants'

// `content` : blocs typés rendus par components/ContentBlocks.js
// (h2 / p / ul / table), avec liens internes au format Markdown
// `[ancre descriptive](/chemin)` et gras `**mot**` directement dans le texte.
// Chaque article relie au minimum 2 pages services + la page Angers.
export const ARTICLES = [
  {
    slug: 'polissage-ou-lustrage-quelle-difference',
    title: 'Polissage ou lustrage : quelle prestation choisir pour votre carrosserie ?',
    excerpt:
      "Deux mots que l'on confond souvent, deux résultats bien différents. Comparatif complet pour choisir entre polissage et lustrage selon l'état réel de votre peinture.",
    date: '2026-01-12',
    updatedDate: '2026-10-09',
    readTime: '6 min',
    metaDescription:
      "Polissage ou lustrage : quelle différence, quel prix et lequel choisir pour votre carrosserie ? Comparatif et conseils de La Clean Compagny, à Angers.",
    content: [
      { type: 'p', text: "C'est l'une des questions qui revient le plus souvent lors de nos premiers échanges avec un client : « il faudrait polir ou juste lustrer ma voiture ? » Les deux termes sont fréquemment confondus, alors qu'ils désignent des opérations très différentes, avec des objectifs, des techniques et des résultats distincts." },
      { type: 'h2', text: 'Le polissage : une opération de correction' },
      { type: 'p', text: "Le polissage consiste à retirer une fine couche de vernis, de manière contrôlée et mesurée, à l'aide d'une pâte légèrement abrasive et d'une machine à faible ou moyenne vitesse. L'objectif : effacer les micro-rayures, les hologrammes laissés par un lavage inadapté, les traces d'oxydation ou le voile terne qui s'installe avec les années. C'est une opération technique qui demande de la précision, car chaque passage retire de la matière — une carrosserie ne se polit pas indéfiniment." },
      { type: 'p', text: "Un bon polissage redonne littéralement de la profondeur à une peinture fatiguée. C'est la prestation à privilégier avant un [traitement céramique](/prestations/traitement-ceramique), ou simplement pour redonner un aspect neuf à un véhicule qui a vécu quelques années sur la route. Retrouvez le détail de nos formules sur notre page [lustrage et polissage de carrosserie à Angers](/prestations/lustrage-polissage)." },
      { type: 'h2', text: 'Le lustrage : une finition sans correction' },
      { type: 'p', text: "Le lustrage, à l'inverse, n'a pas vocation à corriger la peinture : il s'agit d'une finition non abrasive qui vient raviver la brillance, combler très légèrement les micro-défauts et sublimer le rendu final. C'est une étape plus douce, souvent réalisée après un polissage, ou seule sur une carrosserie déjà en bon état pour entretenir son éclat entre deux opérations plus poussées." },
      { type: 'h2', text: 'Polissage ou lustrage : le comparatif' },
      { type: 'table', headers: ['', 'Polissage', 'Lustrage'], rows: [
        ['Objectif', 'Corriger la peinture', 'Raviver la brillance'],
        ['Technique', 'Pâte abrasive, retire du vernis', 'Finition non abrasive'],
        ['Résultat', 'Micro-rayures et hologrammes effacés', 'Éclat sublimé, pas de correction'],
        ['Tarif indicatif', 'Dès 350 €', 'Dès 59 €'],
        ['À utiliser quand…', 'Défauts visibles au soleil', 'Carrosserie déjà en bon état'],
      ] },
      { type: 'h2', text: 'Comment savoir ce dont votre véhicule a besoin ?' },
      { type: 'p', text: "Tout dépend de l'état réel de votre peinture : présence de micro-rayures visibles au soleil, aspect terne malgré un lavage récent, hologrammes en forme de toile d'araignée sous certains angles de lumière… Ces signes indiquent qu'un polissage sera nécessaire avant toute finition. Si votre carrosserie est simplement un peu fatiguée mais sans défaut marqué, un lustrage peut suffire à lui redonner tout son éclat." },
      { type: 'p', text: "Dans le doute, le plus simple reste d'en discuter directement avec nous : lors de chaque devis, nous examinons votre véhicule à [Angers et dans toute notre zone d'intervention](/zone-intervention/angers) et vous orientons vers la prestation la plus adaptée — sans vous vendre plus que ce dont il a réellement besoin." },
    ],
  },
  {
    slug: 'traitement-ceramique-pourquoi-comment',
    title: 'Traitement céramique : pourquoi et comment protéger durablement votre peinture',
    excerpt:
      "Le traitement céramique a le vent en poupe, mais que fait-il vraiment ? Décryptage d'une protection qui change durablement le rapport à l'entretien de votre véhicule.",
    date: '2026-02-03',
    readTime: '5 min',
    metaDescription:
      "Qu'est-ce que le traitement céramique et pourquoi protéger la carrosserie de votre véhicule ? Explications et conseils de La Clean Compagny, à Angers.",
    content: [
      { type: 'p', text: "Longtemps réservé aux véhicules de collection ou de compétition, le traitement céramique s'est largement démocratisé ces dernières années. Et pour cause : il transforme durablement la façon dont votre véhicule vieillit et se salit." },
      { type: 'h2', text: 'Concrètement, à quoi sert un traitement céramique ?' },
      { type: 'p', text: "Le traitement céramique consiste à appliquer, après une préparation minutieuse de la carrosserie (décontamination puis [polissage](/prestations/lustrage-polissage) si nécessaire), une résine à base de silice qui se lie chimiquement au vernis. Le résultat : une couche de protection dure, hydrophobe et résistante, qui vient se substituer aux cires classiques dont l'effet ne dure que quelques semaines — le détail dans notre comparatif [traitement céramique vs cire](/conseils/traitement-ceramique-vs-cire)." },
      { type: 'p', text: "Concrètement, l'eau, la poussière et la plupart des salissures ne s'accrochent plus de la même façon : elles glissent sur la carrosserie au lieu de s'y incruster. Le lavage devient plus rapide, plus simple, et la peinture reste protégée des agressions UV, qui sont l'une des premières causes de ternissement dans le temps." },
      { type: 'h2', text: 'Pourquoi préparer la carrosserie avant l’application ?' },
      { type: 'p', text: "Un traitement céramique appliqué sur une peinture non préparée fige tous les défauts existants sous la couche de protection — micro-rayures, hologrammes, résidus de pollution. C'est pour cela que nous ne l'appliquons jamais sans étape de décontamination, et de polissage si l'état de la carrosserie le justifie. Cette préparation conditionne directement la qualité et la durabilité du résultat final. Le détail complet de la prestation est sur notre page [traitement céramique à Angers](/prestations/traitement-ceramique)." },
      { type: 'h2', text: 'Un investissement, pas une dépense' },
      { type: 'p', text: "Le traitement céramique demande un investissement plus important qu'une simple cire, mais sa durabilité change la donne : protection dans la durée, entretien facilité, et une brillance qui reste nette bien après l'application. C'est particulièrement pertinent pour les véhicules exposés en extérieur, les voitures de prestige, ou tout simplement pour qui veut garder sa voiture impeccable sans y consacrer un week-end par mois. Nous intervenons sur toute notre [zone d'intervention à Angers](/zone-intervention/angers) et dans un rayon de 30 km." },
    ],
  },
  {
    slug: 'entretenir-interieur-cuir-bons-gestes',
    title: 'Entretenir un intérieur cuir : les bons gestes pour éviter le craquellement',
    excerpt:
      'Le cuir vieillit mal quand on le néglige. Voici les erreurs à éviter et les bons réflexes pour préserver la souplesse de votre sellerie dans la durée.',
    date: '2026-03-01',
    readTime: '4 min',
    metaDescription:
      "Comment entretenir un intérieur cuir et éviter le craquellement ? Les conseils d'expert de La Clean Compagny pour préserver votre sellerie, à Angers.",
    content: [
      { type: 'p', text: "Une sellerie cuir bien entretenue peut traverser les années sans perdre son cachet. Mal entretenue, elle se dessèche, se ternit, et finit par craqueler — un défaut qui, une fois installé, n'a plus vraiment de retour en arrière possible. Voici l'essentiel à savoir." },
      { type: 'h2', text: 'Les erreurs les plus courantes' },
      { type: 'p', text: "L'erreur numéro un : utiliser des produits ménagers classiques ou des lingettes non adaptées, qui décapent le film de protection du cuir et accélèrent son dessèchement. La deuxième erreur, tout aussi fréquente : ne rien faire, en pensant que le cuir « s'entretient tout seul ». À l'inverse d'un tissu, le cuir est une matière vivante qui a besoin d'être nourrie régulièrement, sous peine de perdre sa souplesse." },
      { type: 'h2', text: 'Le bon protocole d’entretien' },
      { type: 'p', text: "Un entretien du cuir digne de ce nom se fait en deux temps : un nettoyage en profondeur pour retirer la saleté incrustée dans le grain sans agresser la matière, suivi d'un traitement nourrissant et protecteur qui redonne de la souplesse et forme une barrière contre les UV et la transpiration. C'est cette étape de nourrissage, souvent négligée, qui fait toute la différence sur la durée de vie de votre sellerie. Le détail de notre prestation figure sur notre page [nettoyage intérieur voiture à Angers](/prestations/nettoyage-interieur-voiture)." },
      { type: 'h2', text: 'À quelle fréquence ?' },
      { type: 'p', text: "Pour un usage quotidien, un traitement complet une à deux fois par an suffit généralement, en complément d'un dépoussiérage régulier. Les zones les plus exposées — siège conducteur, accoudoirs, volant — méritent une attention particulière car ce sont elles qui craquellent en premier." },
      { type: 'p', text: "Si votre cuir montre déjà des signes de dessèchement, mieux vaut agir maintenant : plus l'intervention est précoce, plus les résultats sont durables. Notre traitement cuir associe nettoyage en profondeur et nourrissage protecteur, adaptés au type et à la couleur de votre sellerie, directement chez vous à [Angers et dans un rayon de 30 km](/zone-intervention/angers)." },
    ],
  },
  {
    slug: 'voiture-occasion-desinfection-ozone',
    title: 'Voiture d’occasion : pourquoi une désinfection à l’ozone change tout',
    excerpt:
      "Vous venez d'acheter un véhicule d'occasion ? Voici pourquoi la désinfection à l'ozone devrait être votre premier réflexe, bien au-delà d'un simple nettoyage.",
    date: '2026-03-20',
    readTime: '3 min',
    metaDescription:
      "Pourquoi faire une désinfection à l'ozone après l'achat d'une voiture d'occasion ? Explications de La Clean Compagny, à Angers.",
    content: [
      { type: 'p', text: "Acheter un véhicule d'occasion, c'est aussi hériter de tout ce que son précédent propriétaire y a laissé : odeurs, bactéries, acariens, parfois installés depuis des années dans les tissus, la moquette et les gaines de ventilation. Un nettoyage classique, même minutieux, ne suffit pas toujours à s'en débarrasser complètement." },
      { type: 'h2', text: 'Ce que fait réellement l’ozone' },
      { type: 'p', text: "L'ozone est un gaz oxydant naturellement instable, qui a la particularité de pénétrer partout où l'air circule : tissus, mousses des sièges, moquettes, mais aussi le circuit de ventilation et de climatisation, souvent le grand oublié du nettoyage automobile. En se décomposant, il neutralise bactéries, moisissures, acariens et les molécules responsables des odeurs, sans laisser de résidu chimique ni de parfum masquant. Le détail de la prestation est sur notre page [désinfection à l'ozone à Angers](/prestations/desinfection-ozone)." },
      { type: 'h2', text: 'Une étape recommandée après tout achat d’occasion' },
      { type: 'p', text: "Contrairement à un simple désodorisant qui masque temporairement une odeur, l'ozone s'attaque à sa source. C'est pour cette raison que nous recommandons systématiquement ce traitement après l'achat d'un véhicule d'occasion, en complément d'un [nettoyage intérieur complet](/prestations/nettoyage-interieur-voiture) — particulièrement utile en cas d'odeur de tabac, d'animaux ou d'humidité. Voir aussi notre article [comment enlever une mauvaise odeur dans une voiture](/conseils/enlever-mauvaise-odeur-voiture)." },
      { type: 'p', text: "Le traitement est sans danger pour l'habitacle une fois le véhicule aéré, et le résultat se fait sentir (littéralement) dès la première utilisation. Un excellent moyen de vous approprier votre nouvelle voiture avant même son premier trajet, où que vous soyez dans notre [zone d'intervention autour d'Angers](/zone-intervention/angers)." },
    ],
  },
  {
    slug: 'combien-coute-nettoyage-voiture-angers',
    title: `Combien coûte un nettoyage de voiture à Angers en ${CURRENT_YEAR} ?`,
    excerpt:
      "Un tour d'horizon complet des tarifs de nettoyage automobile à Angers : formules, prestations complémentaires, et ce qui fait varier le prix final.",
    date: '2026-10-09',
    readTime: '6 min',
    metaDescription: `Prix d'un nettoyage de voiture à Angers en ${CURRENT_YEAR} : de 45 € à 179 € selon la prestation. Grille tarifaire complète et facteurs de prix.`,
    content: [
      { type: 'p', text: `À Angers, le prix d'un nettoyage de voiture varie de 45 € pour un simple lavage extérieur à 179 € pour une remise en état complète, intérieur et extérieur. Le tarif exact dépend du gabarit de votre véhicule, de son état, et des prestations choisies — voici le détail complet, avec nos tarifs ${CURRENT_YEAR}.` },
      { type: 'h2', text: 'La grille tarifaire complète' },
      { type: 'table', headers: ['Prestation', 'Tarif indicatif'], rows: [
        ['Lavage extérieur', 'dès 45 €'],
        ['Nettoyage intérieur (Coup de Propre)', 'dès 109 €'],
        ['Remise en état complète (Sortie de Concession)', 'dès 179 €'],
        ['Lustrage minute', 'dès 59 €'],
        ['Décontamination complète', 'dès 100 €'],
        ['Polissage (correction avancée)', 'dès 350 €'],
        ['Rénovation optiques (la paire)', 'dès 80 €'],
        ['Désinfection à l’ozone', 'dès 59 €'],
        ['Traitement céramique', 'sur devis'],
      ] },
      { type: 'h2', text: 'Ce qui fait varier le prix' },
      { type: 'ul', items: [
        "**Le gabarit du véhicule** : citadine, berline, SUV ou utilitaire n'impliquent pas le même temps d'intervention, donc pas le même tarif.",
        "**L'état du véhicule** : un habitacle très sale ou une carrosserie fortement encrassée demandent davantage de travail que nos formules de base ne couvrent par défaut.",
        "**Les prestations complémentaires choisies** : [lustrage ou polissage](/prestations/lustrage-polissage), traitement cuir, désinfection à l'ozone... chacune a son propre tarif, cumulable à la formule principale.",
      ] },
      { type: 'h2', text: 'Nos deux formules principales' },
      { type: 'p', text: "Le **Coup de Propre** (dès 109 €) est notre formule d'entretien régulier : aspiration complète, dépoussiérage, nettoyage des vitres et tapis, désodorisation. La **Sortie de Concession** (dès 179 €) y ajoute le nettoyage en profondeur des plastiques, le shampouinage des tapis, et inclut le lavage extérieur complet, offert. Tout le détail est sur notre page [nettoyage intérieur voiture à Angers](/prestations/nettoyage-interieur-voiture)." },
      { type: 'h2', text: 'Un tarif confirmé avant intervention' },
      { type: 'p', text: "Nos formules sont affichées « à partir de » car le tarif final dépend du gabarit et de l'état de votre véhicule. Pour toute prestation complémentaire (polissage, céramique, décontamination), un devis est systématiquement établi avant intervention — sans mauvaise surprise le jour J. Demandez le vôtre en ligne, pour un nettoyage à [Angers et dans un rayon de 30 km](/zone-intervention/angers)." },
    ],
  },
  {
    slug: 'enlever-tache-siege-tissu-voiture',
    title: 'Comment enlever une tache sur un siège de voiture en tissu ?',
    excerpt:
      "Café renversé, tache de gras, trace suspecte... Les bons gestes pour traiter une tache sur un siège tissu sans l'aggraver, et quand mieux vaut appeler un pro.",
    date: '2026-10-09',
    readTime: '5 min',
    metaDescription:
      'Comment enlever une tache sur un siège de voiture en tissu ? Méthode étape par étape, astuces maison et quand faire appel à un professionnel, à Angers.',
    content: [
      { type: 'p', text: "Face à une tache fraîche sur un siège tissu, le réflexe à avoir est toujours le même : agir vite, sans frotter. Plus une tache sèche et s'incruste dans les fibres, plus elle devient difficile à retirer complètement — y compris pour un professionnel." },
      { type: 'h2', text: 'Le bon geste, étape par étape' },
      { type: 'ul', items: [
        "**Tamponnez, ne frottez jamais** : avec un chiffon propre et sec, absorbez le maximum de liquide sans l'étaler ni l'enfoncer davantage dans le tissu.",
        "**Testez tout produit sur une zone cachée** avant de l'appliquer sur la tache elle-même, pour vérifier qu'il ne décolore pas le tissu.",
        "**Utilisez un produit adapté à la nature de la tache** : de l'eau tiède savonneuse pour une tache grasse légère, un mélange d'eau et de vinaigre blanc dilué pour une odeur, du bicarbonate en pâte pour absorber une tache fraîche.",
        "**Laissez sécher à l'air libre**, vitres ouvertes si possible, pour éviter que l'humidité ne génère une odeur de moisi.",
      ] },
      { type: 'h2', text: 'Les taches les plus courantes' },
      { type: 'p', text: "Une tache de café ou de boisson sucrée se traite à l'eau tiède légèrement savonneuse, en tamponnant de l'extérieur vers le centre pour ne pas l'étaler. Une tache de gras (fast-food, cambouis) réagit bien à un peu de terre de Sommières ou de bicarbonate laissé en place quelques heures avant aspiration. Les taches de sang ou de produits organiques, elles, doivent être traitées à l'eau froide uniquement — l'eau chaude a tendance à les fixer." },
      { type: 'h2', text: 'Quand faire appel à un professionnel' },
      { type: 'p', text: "Une tache ancienne, déjà sèche, une odeur qui persiste malgré le nettoyage, ou une sellerie tissu entièrement grisée par l'usage : dans ces cas, les méthodes maison atteignent vite leurs limites. Un nettoyage professionnel permet une extraction en profondeur, avec des produits et un matériel que l'on ne trouve pas chez soi. Voir le détail de notre [nettoyage intérieur voiture à Angers](/prestations/nettoyage-interieur-voiture), qui comprend le nettoyage complet des tapis et moquettes." },
      { type: 'p', text: "Si la tache est accompagnée d'une odeur tenace (tabac, humidité, animal), un nettoyage seul ne suffit parfois pas : associez-le à une [désinfection à l'ozone](/prestations/desinfection-ozone), qui traite la source de l'odeur en profondeur." },
      { type: 'h2', text: 'Et sur un canapé ou un matelas ?' },
      { type: 'p', text: "Les mêmes principes s'appliquent à vos textiles d'intérieur. Pour une tache incrustée sur un canapé ou un matelas, notre prestation de [nettoyage de canapé et matelas à Angers](/prestations/nettoyage-canape-matelas) utilise les mêmes méthodes professionnelles que pour nos selleries automobiles, directement chez vous." },
    ],
  },
  {
    slug: 'enlever-poils-chien-voiture',
    title: 'Comment enlever les poils de chien dans une voiture ?',
    excerpt:
      'Les poils de chien s’accrochent aux textiles comme nulle part ailleurs. Nos astuces pour les enlever efficacement, et les bons réflexes pour en limiter l’accumulation.',
    date: '2026-10-09',
    readTime: '4 min',
    metaDescription:
      'Comment enlever les poils de chien dans une voiture ? Astuces efficaces (gants humides, brosse, aspirateur) et conseils pour un nettoyage en profondeur à Angers.',
    content: [
      { type: 'p', text: "Les poils de chien ont la particularité de s'enrouler autour des fibres textiles, ce qui les rend bien plus difficiles à retirer qu'une simple poussière. Un aspirateur classique ne suffit souvent pas à lui seul : voici une méthode plus efficace." },
      { type: 'h2', text: 'La méthode la plus efficace' },
      { type: 'ul', items: [
        "**Un gant en caoutchouc humide** : passé sur les sièges et la moquette, il attire les poils par effet d'électricité statique et les regroupe en petits amas faciles à ramasser.",
        "**Une brosse à poils doux ou un velcro** : efficace sur les tissus à grain plus serré, en frottant dans un seul sens pour soulever les poils accrochés.",
        "**L'aspirateur en dernière étape**, idéalement avec un embout brosse motorisé, pour terminer le travail une fois les poils décollés des fibres.",
        "**Un léger spray anti-statique textile** avant de passer l'aspirateur, qui réduit l'adhérence des poils restants aux sièges.",
      ] },
      { type: 'h2', text: 'Pourquoi un simple aspirateur ne suffit pas toujours' },
      { type: 'p', text: "Les poils fins s'enroulent littéralement autour des fibres du tissu, en particulier sur les moquettes et les tapis. L'aspiration seule retire surtout les poils en surface, pas ceux déjà incrustés — d'où l'intérêt de les décoller mécaniquement (gant, brosse) avant de passer l'aspirateur." },
      { type: 'h2', text: 'Prévenir plutôt que guérir' },
      { type: 'p', text: "Une housse de protection sur la banquette arrière ou le coffre limite fortement l'accumulation de poils sur les textiles d'origine, plus difficiles à nettoyer en profondeur qu'une housse amovible lavable en machine." },
      { type: 'h2', text: 'Quand passer par un nettoyage professionnel' },
      { type: 'p', text: "Si les poils sont incrustés depuis longtemps, ou si votre véhicule accumule aussi des odeurs d'animal, un nettoyage professionnel permet une extraction bien plus complète. Notre formule [nettoyage intérieur voiture à Angers](/prestations/nettoyage-interieur-voiture) comprend l'aspiration complète de l'habitacle, et nous recommandons souvent d'y associer une [désinfection à l'ozone](/prestations/desinfection-ozone) pour éliminer en même temps les allergènes et les odeurs liés aux poils d'animaux." },
      { type: 'p', text: "Nous intervenons directement chez vous, à [Angers et dans un rayon de 30 km](/zone-intervention/angers), avec tout le matériel nécessaire." },
    ],
  },
  {
    slug: 'enlever-mauvaise-odeur-voiture',
    title: 'Comment enlever une mauvaise odeur dans une voiture (tabac, humidité, animal) ?',
    excerpt:
      "Tabac, humidité, animal de compagnie : les odeurs tenaces s'incrustent dans les tissus et la ventilation. Voici ce qui fonctionne vraiment, et ce qui ne fait que masquer le problème.",
    date: '2026-10-09',
    readTime: '5 min',
    metaDescription:
      'Comment enlever une mauvaise odeur dans une voiture (tabac, humidité, animal) ? Les bons gestes et la solution qui traite la source : la désinfection à l’ozone.',
    content: [
      { type: 'p', text: "Une mauvaise odeur dans l'habitacle a presque toujours une source précise — tissus imprégnés, humidité stagnante, circuit de ventilation — qu'un désodorisant classique ne fait que masquer temporairement. Pour s'en débarrasser durablement, il faut d'abord comprendre d'où elle vient." },
      { type: 'h2', text: 'Identifier la source avant d’agir' },
      { type: 'p', text: "Une odeur de tabac s'incruste dans les textiles, la moquette, et même les plastiques, au point de ressortir davantage encore sous la chaleur. Une odeur d'humidité vient le plus souvent d'une fuite non détectée (joint de pare-brise, toit ouvrant) ou d'un tapis resté humide trop longtemps. Une odeur d'animal provient des poils, de la salive et parfois de petits accidents sur les sièges ou le coffre." },
      { type: 'h2', text: 'Les gestes qui aident, sans tout résoudre' },
      { type: 'ul', items: [
        'Aérer le véhicule le plus possible, vitres ouvertes, surtout après un lavage intérieur.',
        "Nettoyer en profondeur les textiles concernés : un tissu simplement essuyé en surface continue de libérer l'odeur qu'il a absorbée.",
        'Placer un absorbeur d’odeur (bicarbonate, charbon actif) pendant quelques jours, en complément d’un nettoyage — jamais à sa place.',
        "Vérifier le filtre d'habitacle de la climatisation, souvent oublié alors qu'il peut être la source d'une odeur persistante à chaque mise en route de la ventilation.",
      ] },
      { type: 'h2', text: 'Pourquoi un désodorisant ne suffit pas' },
      { type: 'p', text: "Un désodorisant masque une odeur en la recouvrant d'un parfum plus fort, sans jamais neutraliser les molécules qui en sont à l'origine. Résultat : l'odeur réapparaît dès que le parfum s'estompe, parfois mélangée à lui de façon encore moins agréable." },
      { type: 'h2', text: 'La solution qui traite la source : l’ozone' },
      { type: 'p', text: "Notre [désinfection à l'ozone à Angers](/prestations/desinfection-ozone) (dès 59 €) agit différemment : ce gaz oxydant pénètre dans les tissus, la moquette et le circuit de ventilation pour neutraliser bactéries, moisissures et les molécules responsables de l'odeur, sans laisser de résidu ni de parfum masquant. C'est le traitement que nous recommandons systématiquement après l'achat d'un véhicule d'occasion — voir notre article [pourquoi une désinfection à l'ozone change tout sur une occasion](/conseils/voiture-occasion-desinfection-ozone)." },
      { type: 'p', text: "Pour une odeur liée à une tache ou une saleté visible, associez ce traitement à un [nettoyage intérieur complet](/prestations/nettoyage-interieur-voiture) : les deux prestations se complètent, à [Angers et dans un rayon de 30 km](/zone-intervention/angers)." },
    ],
  },
  {
    slug: 'preparer-voiture-hiver',
    title: 'Préparer sa voiture pour l’hiver : 6 gestes essentiels',
    excerpt:
      "Sel de déneigement, gel, projections : l'hiver est rude pour votre carrosserie et votre habitacle. Six gestes simples pour limiter les dégâts avant que la saison ne s'installe.",
    date: '2026-10-09',
    readTime: '5 min',
    metaDescription:
      'Préparer sa voiture pour l’hiver : 6 gestes essentiels pour protéger carrosserie et habitacle du sel, du gel et de l’humidité. Conseils de La Clean Compagny, Angers.',
    content: [
      { type: 'p', text: "Le sel de déneigement, les projections routières et l'humidité font de l'hiver la saison la plus agressive pour un véhicule. Quelques gestes pris avant les premiers frimas limitent nettement l'usure de la carrosserie et de l'habitacle." },
      { type: 'h2', text: '1. Laver la voiture avant les premiers grands froids' },
      { type: 'p', text: "Un lavage extérieur complet juste avant l'hiver retire les résidus accumulés qui, combinés au sel et au gel, accélèrent la corrosion de la carrosserie et des passages de roue. Voir notre [lavage extérieur à domicile à Angers](/prestations/lavage-exterieur-domicile)." },
      { type: 'h2', text: '2. Protéger la carrosserie avant l’exposition au sel' },
      { type: 'p', text: "Une protection — cire ou idéalement [traitement céramique](/prestations/traitement-ceramique) — limite l'adhérence du sel et des projections sur la peinture, et facilite grandement le nettoyage tout au long de la saison." },
      { type: 'h2', text: '3. Vérifier le liquide lave-glace' },
      { type: 'p', text: "Un lave-glace non adapté au gel peut geler dans le circuit et l'endommager. Un simple contrôle et, si besoin, un remplacement par un liquide spécial hiver évite ce désagrément." },
      { type: 'h2', text: '4. Nettoyer et traiter les joints de portes' },
      { type: 'p', text: "Des joints encrassés collent, voire gèlent, par temps très froid. Un nettoyage suivi d'un léger traitement silicone les garde souples et évite les mauvaises surprises au moment d'ouvrir la portière un matin de gel." },
      { type: 'h2', text: '5. Soigner l’intérieur contre l’humidité' },
      { type: 'p', text: "Neige fondue, chaussures mouillées : l'habitacle encaisse beaucoup d'humidité en hiver. Des tapis adaptés et un nettoyage intérieur en amont de la saison limitent les odeurs de moisi qui s'installent vite dans un environnement humide. Voir notre [nettoyage intérieur voiture à Angers](/prestations/nettoyage-interieur-voiture)." },
      { type: 'h2', text: '6. Contrôler les optiques avant les journées courtes' },
      { type: 'p', text: "Avec des journées plus courtes, un éclairage net devient encore plus important. Des optiques jaunies diffusent la lumière au lieu de la projeter : une rénovation avant l'hiver est un bon réflexe sécurité." },
      { type: 'p', text: "Nous intervenons directement chez vous, à [Angers et dans un rayon de 30 km](/zone-intervention/angers), pour préparer votre véhicule avant l'hiver." },
    ],
  },
  {
    slug: 'preparer-voiture-revente',
    title: 'Préparer sa voiture pour la revente : le nettoyage qui fait la différence',
    excerpt:
      "Un véhicule impeccable se vend plus vite, et souvent mieux. Les prestations de detailing qui font vraiment la différence au moment de la revente.",
    date: '2026-10-09',
    readTime: '5 min',
    metaDescription:
      'Préparer sa voiture pour la revente : quelles prestations de nettoyage font vraiment la différence (intérieur, carrosserie, optiques, odeurs) ? Conseils d’Angers.',
    content: [
      { type: 'p', text: "Un acheteur se fait une opinion sur un véhicule dans les toutes premières secondes. Au-delà de la mécanique, l'état esthétique — propreté, brillance, odeur — pèse directement sur la vitesse de vente et sur le prix que l'acheteur est prêt à proposer." },
      { type: 'h2', text: 'L’intérieur, le premier détail qui marque' },
      { type: 'p', text: "Un habitacle qui sent le propre et qui ne porte aucune trace d'usure visible rassure immédiatement sur l'entretien général du véhicule. Notre [nettoyage intérieur voiture à Angers](/prestations/nettoyage-interieur-voiture) (dès 109 €) couvre l'aspiration complète, les plastiques, les vitres et les tapis — l'essentiel pour une première impression nette." },
      { type: 'h2', text: 'La carrosserie, sublimée sans surinvestir' },
      { type: 'p', text: "Un [lustrage minute](/prestations/lustrage-polissage) (dès 59 €) redonne de la brillance à la peinture sans l'investissement d'un polissage complet — largement suffisant pour une annonce qui donne envie de venir voir le véhicule en vrai." },
      { type: 'h2', text: 'Les optiques, un détail que les acheteurs remarquent' },
      { type: 'p', text: "Des phares jaunis donnent immédiatement une impression de véhicule négligé, même si le reste est impeccable. Notre [rénovation des phares à Angers](/prestations/renovation-optiques) (dès 80 € la paire) redonne transparence et modernité au regard du véhicule." },
      { type: 'h2', text: 'Les odeurs, invisibles mais décisives' },
      { type: 'p', text: "Une odeur de tabac ou d'animal peut faire fuir un acheteur en quelques secondes, même sur un véhicule par ailleurs en bon état. Une [désinfection à l'ozone](/prestations/desinfection-ozone) élimine la source de l'odeur plutôt que de la masquer le temps d'une visite." },
      { type: 'h2', text: 'Et pour les photos de l’annonce ?' },
      { type: 'p', text: "Un véhicule propre, lustré et sans odeur se photographie mieux et génère davantage de contacts sérieux. Faire réaliser ces prestations avant de publier votre annonce, plutôt qu'au moment de la visite, change souvent la donne sur le nombre et la qualité des demandes reçues." },
      { type: 'p', text: "Nous intervenons directement chez vous, à [Angers et dans un rayon de 30 km](/zone-intervention/angers), pour préparer votre véhicule avant une vente." },
    ],
  },
  {
    slug: 'nettoyage-domicile-vs-station-lavage',
    title: 'Nettoyage de voiture à domicile vs station de lavage : 5 différences',
    excerpt:
      "Portique automatique, lavage libre-service ou nettoyage à domicile : les différences concrètes en termes de résultat, de risque pour la carrosserie et de niveau de détail.",
    date: '2026-10-09',
    readTime: '5 min',
    metaDescription:
      'Nettoyage de voiture à domicile ou station de lavage : 5 différences concrètes (technique, risque de rayures, niveau de détail, prix, confort). Comparatif.',
    content: [
      { type: 'p', text: "Station de lavage automatique, portique à rouleaux, lavage en libre-service ou intervention à domicile : ces méthodes n'offrent ni le même résultat, ni le même niveau de soin pour votre véhicule. Voici les différences concrètes." },
      { type: 'h2', text: 'Le comparatif' },
      { type: 'table', headers: ['Critère', 'Nettoyage à domicile', 'Station de lavage'], rows: [
        ['Technique', 'Lavage manuel en plusieurs phases', 'Brosses mécaniques ou haute pression'],
        ['Risque de micro-rayures', 'Faible (gants et seaux dédiés)', 'Variable selon l’état des brosses'],
        ['Niveau de détail intérieur', 'Aspiration, plastiques, tapis inclus', 'Généralement extérieur seul'],
        ['Prix indicatif', 'Dès 45 € (extérieur), dès 109 € (intérieur)', 'Quelques euros à quelques dizaines d’euros'],
        ['Confort', 'Aucun déplacement, le pro vient chez vous', 'Déplacement et temps d’attente'],
      ] },
      { type: 'h2', text: 'Pourquoi le lavage manuel limite les micro-rayures' },
      { type: 'p', text: "Un portique automatique utilise les mêmes brosses pour de nombreux véhicules successifs : les particules abrasives qu'elles accumulent (sable, gravillons) peuvent marquer la peinture au fil des passages. Un [lavage extérieur à domicile](/prestations/lavage-exterieur-domicile), réalisé en deux phases avec du matériel dédié à votre seul véhicule, réduit nettement ce risque." },
      { type: 'h2', text: 'L’intérieur, le grand absent des stations de lavage' },
      { type: 'p', text: "La plupart des stations se concentrent sur l'extérieur ; l'intérieur reste à votre charge, ou nécessite un passage séparé à l'aspirateur en libre-service. Un [nettoyage intérieur voiture à domicile](/prestations/nettoyage-interieur-voiture) couvre en une seule intervention l'aspiration complète, les plastiques, les vitres et les tapis." },
      { type: 'h2', text: 'Dans quel cas choisir quoi ?' },
      { type: 'p', text: "Pour un entretien très ponctuel et rapide entre deux rendez-vous plus complets, une station de lavage reste une solution pratique. Pour un résultat soigné, sans risque pour la peinture, et sans y consacrer votre temps, un nettoyage à domicile reste la solution la plus complète — surtout lorsqu'intérieur et extérieur sont traités en une seule intervention, chez vous, à [Angers et dans un rayon de 30 km](/zone-intervention/angers)." },
    ],
  },
  {
    slug: 'traitement-ceramique-vs-cire',
    title: 'Traitement céramique vs cire : lequel choisir pour sa voiture ?',
    excerpt:
      "Deux façons de protéger sa peinture, deux niveaux d'investissement et de durabilité très différents. Le comparatif pour choisir en connaissance de cause.",
    date: '2026-10-09',
    readTime: '5 min',
    metaDescription:
      'Traitement céramique ou cire : quelle protection choisir pour la carrosserie de sa voiture ? Comparatif durée, prix et entretien. Conseils La Clean Compagny.',
    content: [
      { type: 'p', text: "Cire et traitement céramique répondent au même besoin — protéger et faire briller la carrosserie — mais avec des niveaux de performance, de durabilité et d'investissement très différents." },
      { type: 'h2', text: 'Le comparatif' },
      { type: 'table', headers: ['Critère', 'Cire', 'Traitement céramique'], rows: [
        ['Durée de protection', 'Quelques semaines', '3 à 5 ans'],
        ['Protection UV', 'Limitée', 'Élevée'],
        ['Effet hydrophobe', 'Modéré', 'Marqué, facilite le lavage'],
        ['Préparation nécessaire', 'Minimale', 'Décontamination, polissage si besoin'],
        ['Investissement', 'Faible, à renouveler souvent', 'Plus élevé, sur devis après inspection'],
      ] },
      { type: 'h2', text: 'La cire : une solution d’entretien ponctuelle' },
      { type: 'p', text: "Rapide à appliquer et peu coûteuse, la cire apporte un surcroît de brillance et une protection temporaire. Son principal défaut : son effet s'estompe en quelques semaines, au gré des lavages et de l'exposition aux UV, ce qui demande un renouvellement régulier pour rester efficace." },
      { type: 'h2', text: 'Le traitement céramique : un investissement sur plusieurs années' },
      { type: 'p', text: "Notre [traitement céramique à Angers](/prestations/traitement-ceramique) consiste à faire se lier chimiquement une résine à base de silice au vernis, pour une protection dure et hydrophobe qui dure plusieurs années. Il nécessite en amont une préparation sérieuse — décontamination, et [polissage](/prestations/lustrage-polissage) si la carrosserie présente des défauts — ce qui explique un tarif toujours établi sur devis, après inspection." },
      { type: 'h2', text: 'Dans quel cas choisir quoi ?' },
      { type: 'p', text: "La cire convient pour un entretien ponctuel, avant un événement ou entre deux prestations plus poussées. Le traitement céramique est un choix pertinent si vous gardez votre véhicule plusieurs années, s'il reste souvent garé en extérieur, ou si vous voulez simplement vous simplifier l'entretien sur la durée. Pour aller plus loin, notre article [traitement céramique : pourquoi et comment](/conseils/traitement-ceramique-pourquoi-comment) détaille tout le processus. Nous intervenons à [Angers et dans un rayon de 30 km](/zone-intervention/angers)." },
    ],
  },
]

export function getArticle(slug) {
  return ARTICLES.find((a) => a.slug === slug)
}
