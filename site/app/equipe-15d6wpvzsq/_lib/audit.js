// Audit GEO + SEO de lacleancompagny.com (22 novembre 2026).
// GEO = être cité par les IA (ChatGPT, Perplexity, Gemini, Google AI Overviews).
// Note globale = moyenne pondérée des 6 axes ci-dessous.

export const AUDIT_DATE = '2026-11-22'

export const AUDIT_AXES = [
  {
    id: 'ia',
    label: 'Accès des IA au site',
    weight: 15,
    before: 70,
    after: 85,
    note: 'Robots ouverts à tous les moteurs et IA, sitemap de 47 pages. Il manquait un fichier llms.txt : ajouté (fiche d’identité pour les IA, prix synchronisés avec le site).',
  },
  {
    id: 'contenu',
    label: 'Contenu citable',
    weight: 25,
    before: 62,
    after: 62,
    note: 'Bons points : prix de départ visibles, FAQ, comparatifs, ~2 000 mots sur l’accueil. À renforcer : faits chiffrés (véhicules traités, produits utilisés, garanties), dates de mise à jour, avis affichés en entier.',
  },
  {
    id: 'confiance',
    label: 'Confiance (E-E-A-T, mentions)',
    weight: 15,
    before: 50,
    after: 62,
    note: 'Le site affichait « TVA non applicable (293 B) » alors qu’Enzo facture la TVA, et un SIRET présenté comme SIREN : corrigé. Reste à montrer l’expertise d’Enzo (expérience, formations, nombre de clients).',
  },
  {
    id: 'technique',
    label: 'Technique',
    weight: 15,
    before: 82,
    after: 82,
    note: 'Pages rendues côté serveur (texte lisible sans JavaScript), canonical, Open Graph, sitemap à jour. Titres des pages communes un peu longs (~69 caractères).',
  },
  {
    id: 'schema',
    label: 'Données structurées',
    weight: 10,
    before: 75,
    after: 82,
    note: 'Entreprise (AutoWash), prestations avec prix, FAQ, fil d’Ariane et articles déjà balisés. Ajoutés : horaires (lun-sam 8 h-19 h) et n° de TVA.',
  },
  {
    id: 'local',
    label: 'Autorité locale (fiche Google, citations)',
    weight: 20,
    before: 40,
    after: 40,
    note: 'C’est l’axe qui fait la différence avec FreshInside : rythme d’avis avec photos, posts réguliers sur la fiche, présence identique sur les annuaires (PagesJaunes, Bing, Apple Plans…).',
  },
]

export function auditScore(key = 'after') {
  const w = AUDIT_AXES.reduce((s, a) => s + a.weight, 0)
  return Math.round(AUDIT_AXES.reduce((s, a) => s + a[key] * a.weight, 0) / w)
}

// Plan d'action. done: true = déjà fait dans la mise à jour du 22/11/2026.
export const AUDIT_ACTIONS = [
  // ---- Priorité 1 ----
  { id: 'tva-site', p: 1, done: true, who: 'Claude', title: 'Corriger la mention TVA du site', how: 'Footer, mentions légales, CGV et page tarifs disaient « TVA non applicable, art. 293 B » : remplacé par « Prix TTC, TVA 20 % incluse » + n° de TVA FR91953772282.' },
  { id: 'siret', p: 1, done: true, who: 'Claude', title: 'SIRET affiché comme SIREN', how: 'Le numéro à 14 chiffres est un SIRET : libellés corrigés (SIREN = 953 772 282).' },
  { id: 'llms', p: 1, done: true, who: 'Claude', title: 'Créer /llms.txt', how: 'Fiche lisible par les IA : qui, où, zone, prix, durées, FAQ, pages clés. Générée à partir des données du site, donc toujours à jour.' },
  { id: 'schema-horaires', p: 1, done: true, who: 'Claude', title: 'Horaires et n° de TVA dans les données structurées', how: 'Lundi-samedi 8 h-19 h sur rendez-vous, vatID et SIRET ajoutés au balisage de l’entreprise.' },
  { id: 'avis-rythme', p: 1, who: 'Enzo', title: '2 à 3 avis Google par semaine, avec photos', how: 'Après chaque prestation : « Terminé » → demande d’avis avec les photos avant/après (mail dès que Gmail est branché, sinon partage WhatsApp avec les photos). Les avis avec photos pèsent plus sur Maps.' },
  { id: 'gbp-posts', p: 1, who: 'Pacome', title: '1 post par semaine sur la fiche Google', how: 'Avant/après de la semaine (même visuel que le récap Instagram) + 1 phrase avec « nettoyage voiture Angers » et la commune. Ajouter aussi 5 à 10 photos par mois.' },
  { id: 'gbp-categories', p: 1, who: 'Pacome', title: 'Vérifier les catégories de la fiche', how: 'Principale : « Service de nettoyage automobile » (ou « Service d’esthétique automobile »). Secondaires : lavage auto, lustrage, nettoyage de tapisserie. Zone desservie : Angers + communes du site.' },
  { id: 'citations', p: 1, who: 'Pacome', title: 'Annuaires : même nom, même téléphone, même site', how: 'PagesJaunes, Bing Places, Apple Plans (Business Connect), Cylex, Hoodspot, Facebook. Exactement « La Clean Compagny », 06 38 57 83 04, www.lacleancompagny.com.' },
  // ---- Priorité 2 ----
  { id: 'bing', p: 2, who: 'Pacome', title: 'Bing Webmaster Tools', how: 'ChatGPT Search s’appuie sur l’index de Bing : importer le site depuis la Search Console (2 min) et soumettre le sitemap.' },
  { id: 'faits', p: 2, who: 'Enzo', title: 'Ajouter des faits chiffrés sur le site', how: 'Nombre de véhicules traités depuis 2023, produits utilisés (marques), garantie / reprise si tache persistante, moyens de paiement, conditions d’annulation. Les IA citent des faits précis, pas des slogans.' },
  { id: 'dates', p: 2, who: 'Claude', title: 'Date « Mis à jour le » sur les pages prestations', how: 'Afficher la date et l’ajouter au balisage (dateModified) : signal de fraîcheur pour Google et les IA.' },
  { id: 'communes', p: 2, who: 'Enzo + Claude', title: 'Pages communes plus locales', how: 'Pour Trélazé, Avrillé, Les Ponts-de-Cé… : photos prises sur place, avis de clients de la commune, repères (zones d’activités, quartiers). Aujourd’hui le texte est surtout un modèle avec le nom de la ville.' },
  { id: 'titres', p: 2, who: 'Claude', title: 'Raccourcir les titres des pages communes', how: '« Nettoyage voiture à domicile à Trélazé dès 109 € | La Clean Compagny » fait ~69 caractères : viser 60 pour éviter la coupure dans Google.' },
  { id: 'ancres', p: 2, who: 'Claude', title: 'Liens « En savoir plus » plus parlants', how: 'Remplacer par « Tarifs du nettoyage intérieur », « Lustrage à Angers »… (meilleur maillage interne).' },
  { id: 'avis-entiers', p: 2, who: 'Claude', title: 'Afficher les avis en entier', how: 'Plusieurs avis sont coupés au milieu d’une phrase sur l’accueil et les pages prestations.' },
  // ---- Priorité 3 ----
  { id: 'presse', p: 3, who: 'Pacome', title: 'Être cité ailleurs que sur son site', how: 'Article dans la presse locale (Courrier de l’Ouest, Angers Mag), page partenaire chez BMW Angers / GR Motors avec lien, réponses sur les groupes Facebook locaux. Les IA recoupent les sources.' },
  { id: 'suivi-ia', p: 3, who: 'Pacome', title: 'Tester chaque mois les IA', how: 'Demander à ChatGPT, Perplexity et Gemini : « Qui fait du nettoyage de voiture à domicile à Angers ? ». Noter si La Clean Compagny est citée et devant qui.' },
]
