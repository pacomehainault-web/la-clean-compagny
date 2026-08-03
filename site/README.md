# La Clean Compagny — site web

Site vitrine + devis en ligne pour **La Clean Compagny**, detailing automobile haut de gamme à Angers.

Stack : **Next.js 16** (App Router), React, CSS natif (CSS Modules, pas de Tailwind), sans base de données. Le formulaire de devis/contact envoie un email **directement depuis le site** (voir ci-dessous) ; le bouton WhatsApp ouvre l'application WhatsApp du visiteur avec un message pré-rempli.

## Identité visuelle (v2 — refonte claire)

Le site est passé d'un thème sombre à une esthétique claire et sportive :

- **Fond** : gris Nardo clair (`--color-bg`, `#eeece7`)
- **Accent** : bleu Riviera/Polaire (`--color-blue`, `#0a6cff`) en dégradé sur les CTA
- **Texte** : anthracite quasi-noir (`--color-text`, `#15171b`)
- **Typographie** : Archivo (Black/Bold, très grand corps) pour les titres, Inter pour le texte courant
- **Footer & bandeaux de contraste** : volontairement en encre foncée (`--color-ink`) pour créer un effet de "bookend" premium, façon Porsche/Apple

Tous ces réglages sont centralisés dans `app/globals.css` (variables CSS en haut du fichier) — modifier une couleur là suffit à la propager sur tout le site.

### Fonctionnalités créatives ajoutées

- **Curseur personnalisé** (`components/CustomCursor.js`) : un point + anneau qui suit la souris et grossit au survol des liens/boutons (désactivé sur mobile/tactile).
- **Révélations au scroll** (`components/ScrollRevealInit.js`) : les sections apparaissent en fondu/translation au défilement (classe `.reveal` sur n'importe quel élément). Dégradé en douceur si JavaScript est désactivé (voir `<noscript>` dans `app/layout.js`).
- **Slider avant/après réactif au gyroscope** (`components/BeforeAfterSlider.js`) : sur mobile, un bouton « Incliner le téléphone » active la comparaison avant/après en inclinant l'appareil (API `DeviceOrientationEvent`, avec gestion de la permission iOS).

### Nouvelle page Événements

`app/evenements/` présente la présence de La Clean Compagny sur les rassemblements automobiles (stand, partenaires Kenotek/Motul), avec une galerie de type masonry. Les photos viennent du dossier `Photo enzo /` fourni — si vous avez d'autres photos d'événements à ajouter, déposez-les dans `public/images/evenements/` et complétez le tableau `EVENT_PHOTOS` dans `app/evenements/page.js`.

### Logo

Deux versions du logo sont utilisées, selon le fond :

- `public/images/logo/logo-onlight.png` — tracé recoloré en anthracite, pour les fonds clairs (header, favicon, OG image). Généré à partir de votre fichier « Logo transparent .PNG » d'origine (dont le tracé blanc était invisible sur fond clair).
- `public/images/logo/logo-transparent.png` — votre fichier d'origine (tracé blanc), utilisé sur fond sombre (menu mobile, footer).

## Lancer le site en local

```bash
npm install
npm run dev
```

Puis ouvrir [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # build de production
npm run start   # sert le build de production en local
```

## Arborescence utile

- `app/` — une page par route (App Router). Chaque page a son fichier `page.js` et, si besoin, `page.module.css`.
- `app/api/` — les deux routes qui envoient les emails (`/api/devis`, `/api/contact`).
- `components/` — composants réutilisables (Header, Footer, wizard de devis, galerie, slider avant/après, etc.)
- `lib/data/` — **tout le contenu éditable** : prestations et tarifs, véhicules, avis, FAQ, communes desservies, articles de conseils.
- `lib/constants.js` — coordonnées, horaires, réseaux sociaux, SIREN.
- `lib/mailer.js` — envoi d'email via Gmail (Nodemailer).
- `public/images/` — toutes les photos, déjà renommées pour le SEO.

---

## 1. Envoi d'email automatique — comment l'activer

Le code est déjà en place : quand un client clique sur **« Envoyer ma demande par email »**, le site envoie directement l'email depuis son serveur vers `lacleancompagny49@gmail.com`, sans que le client ait besoin d'ouvrir Gmail ou une messagerie. Tant que les identifiants ci-dessous ne sont pas configurés, le site bascule automatiquement sur l'ancien comportement (ouvrir la messagerie du client) — donc rien ne casse en attendant.

Cela fonctionne en envoyant l'email depuis **votre propre compte Gmail**, via un « mot de passe d'application » (différent de votre mot de passe habituel, et révocable à tout moment).

### Étape 1 — Activer la validation en 2 étapes sur le compte Gmail

Obligatoire pour pouvoir créer un mot de passe d'application.

1. Allez sur [myaccount.google.com/security](https://myaccount.google.com/security)
2. Connectez-vous avec `lacleancompagny49@gmail.com`
3. Section « Comment vous vous connectez à Google » → activez **Validation en deux étapes** si ce n'est pas déjà fait (suivez les instructions, ça prend 2 minutes avec votre téléphone)

### Étape 2 — Créer un mot de passe d'application

1. Allez sur [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Donnez-lui un nom, par exemple `Site La Clean Compagny`
3. Cliquez sur **Créer** : Google affiche un code à **16 caractères** (ex. `abcd efgh ijkl mnop`). Copiez-le — il ne sera plus jamais réaffiché.

### Étape 3 — Renseigner les identifiants

**En local**, créez un fichier `.env.local` à la racine du projet (copiez `.env.example`) :

```bash
cp .env.example .env.local
```

Puis ouvrez `.env.local` et remplissez :

```bash
GMAIL_USER=lacleancompagny49@gmail.com
GMAIL_APP_PASSWORD=abcd efgh ijkl mnop
```

Relancez `npm run dev`. Testez le formulaire de devis ou de contact : l'email doit arriver directement dans la boîte `lacleancompagny49@gmail.com`.

**Sur Vercel** (site en ligne), ajoutez les deux mêmes variables dans les réglages du projet (voir tutoriel de déploiement plus bas, étape 6).

> 💡 Astuce : l'email envoyé a comme adresse de réponse (« Répondre à ») l'adresse email du client s'il l'a renseignée. Vous pouvez donc cliquer sur « Répondre » depuis Gmail pour écrire directement au client.

### Limites à connaître

- Un compte Gmail personnel est limité à environ 500 emails envoyés par jour — largement suffisant pour des demandes de devis.
- Si vous changez le mot de passe de votre compte Google, le mot de passe d'application reste valable (ce n'est pas le même). Vous pouvez le révoquer à tout moment depuis la même page Google.

---

## 2. Et pour WhatsApp ?

**Il n'existe pas d'équivalent « silencieux » pour WhatsApp.** Voici pourquoi, et ce qui est fait à la place.

Le bouton WhatsApp du site ouvre l'application WhatsApp du **client** (sur son téléphone ou navigateur) avec un message déjà rédigé pour vous. Le client n'a qu'à appuyer sur « Envoyer ». Il n'a besoin de se connecter à aucun compte Google — juste d'avoir WhatsApp installé, ce qui est le cas de la quasi-totalité de vos clients.

Pour qu'un message parte **automatiquement vers votre WhatsApp sans aucune action du client**, il faudrait utiliser la **WhatsApp Business Platform** (API officielle de Meta). Concrètement, cela demande :

- un compte **Meta Business** vérifié (pièces d'identité de l'entreprise, délai de validation de plusieurs jours) ;
- un numéro de téléphone dédié à l'API (compliqué à faire cohabiter avec votre WhatsApp Business actuel sur le même numéro) ;
- de passer par un prestataire technique (Twilio, 360dialog, etc.), généralement payant au message ;
- de faire valider un « modèle de message » par Meta pour le tout premier contact avec chaque client.

Bref : plusieurs jours de démarches et un coût récurrent, pour un gain limité puisque le bouton actuel fait déjà le travail en un seul clic pour le client. **Ma recommandation : garder le système actuel.** Si un jour votre volume de demandes justifie cet investissement, on pourra en rediscuter.

---

## 3. Déployer le site sur Vercel (pour le montrer sur d'autres téléphones)

Vercel est l'hébergeur créé par l'équipe de Next.js : gratuit pour ce site, HTTPS automatique, et vous donne une **URL publique en quelques minutes**, sans nom de domaine à acheter pour commencer.

### Étape 1 — Créer un compte Vercel

Allez sur [vercel.com/signup](https://vercel.com/signup) et créez un compte (le plus simple : « Continue with GitHub » — voir étape 2 si vous n'avez pas encore de compte GitHub).

### Étape 2 — Mettre le code sur GitHub

1. Créez un compte sur [github.com](https://github.com) si vous n'en avez pas
2. Créez un nouveau dépôt (bouton vert **New**), nommez-le par exemple `la-clean-compagny`, laissez-le **privé**
3. Depuis votre ordinateur, dans le dossier `site/` du projet, exécutez :

```bash
git add -A
git commit -m "Site La Clean Compagny"
git remote add origin https://github.com/VOTRE-PSEUDO/la-clean-compagny.git
git branch -M main
git push -u origin main
```

*(remplacez `VOTRE-PSEUDO` par votre nom d'utilisateur GitHub — l'URL exacte est affichée par GitHub juste après la création du dépôt)*

### Étape 3 — Importer le projet dans Vercel

1. Dans Vercel, cliquez sur **Add New… → Project**
2. Choisissez le dépôt `la-clean-compagny` que vous venez de créer
3. Vercel détecte automatiquement Next.js — ne changez rien aux réglages
4. Cliquez sur **Deploy**

### Étape 4 — Récupérer votre lien

Après 1 à 2 minutes, Vercel affiche une URL du type `la-clean-compagny.vercel.app`. **C'est ce lien que vous pouvez envoyer à n'importe qui, il fonctionne sur tous les téléphones**, sans rien installer.

### Étape 5 — Redéployer après une modification

À chaque fois que vous (ou moi) modifiez le code et faites un `git push`, Vercel reconstruit et met à jour le site automatiquement en 1 à 2 minutes. Rien à faire de plus.

### Étape 6 — Ajouter les variables d'environnement (email, analytics)

Pour que l'envoi d'email fonctionne aussi sur le site en ligne (pas seulement en local) :

1. Dans le projet Vercel → **Settings → Environment Variables**
2. Ajoutez, une par une :
   - `GMAIL_USER` = `lacleancompagny49@gmail.com`
   - `GMAIL_APP_PASSWORD` = votre mot de passe d'application à 16 caractères
   - `NEXT_PUBLIC_SITE_URL` = l'URL Vercel (ou votre futur nom de domaine)
3. Retournez dans l'onglet **Deployments**, cliquez sur les `···` du dernier déploiement → **Redeploy** (les variables ne s'appliquent qu'au prochain déploiement)

### Étape 7 (plus tard) — Brancher un vrai nom de domaine

Quand vous serez prêt : achetez `lacleancompagny.fr` (chez Vercel directement, ou OVH), puis dans **Settings → Domains** du projet Vercel, ajoutez le domaine et suivez les instructions affichées (quelques réglages DNS chez le vendeur du domaine). Vercel gère le HTTPS automatiquement.

---

## Ce qu'il reste à faire avant la mise en ligne définitive

### Remplacer les avis clients (obligatoire)

Le fichier [`lib/data/reviews.js`](lib/data/reviews.js) contient actuellement **5 avis d'exemple**, clairement marqués `isPlaceholder: true`. Ce sont des textes réalistes mais fictifs, à remplacer par vos vrais avis Google avant la mise en ligne (récupérables depuis le lien `CONTACT.googleReviewUrl`).

### Logo

Le logo actuellement utilisé (`public/images/logo/logo-source.jpg`) est un JPG issu de votre dossier. Il fonctionne bien car son fond est déjà noir (comme le site), mais un **fichier vectoriel ou PNG transparent** donnerait un rendu plus net sur toutes les tailles d'écran. Si vous en obtenez un, remplacez le fichier et régénérez les icônes :

```bash
sips -s format png -z 512 512 public/images/logo/votre-logo-carre.png --out app/icon.png
sips -s format png -z 180 180 public/images/logo/votre-logo-carre.png --out app/apple-icon.png
```

### Mentions légales — hébergeur

Le fichier [`app/mentions-legales/page.js`](app/mentions-legales/page.js) indique que les coordonnées de l'hébergeur seront communiquées sur demande. Une fois le site déployé sur Vercel, vous pouvez mettre à jour cette section avec ses coordonnées officielles (Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA).

### Relecture juridique

Les pages **Mentions légales**, **Politique de confidentialité** et **CGV** sont rédigées à partir de modèles standards pour une micro-entreprise de services. Il est recommandé de les faire relire par un professionnel (comptable, juriste) avant la mise en ligne définitive.

## Modifier le contenu

Tout le contenu « métier » est centralisé dans `lib/data/` — pas besoin de toucher aux pages pour :

| Je veux modifier… | Fichier |
| --- | --- |
| Les tarifs et prestations | `lib/data/services.js` |
| Les types de véhicules du devis | `lib/data/vehicles.js` |
| Les communes desservies | `lib/data/cities.js` |
| Les avis clients | `lib/data/reviews.js` |
| Les questions fréquentes | `lib/data/faq.js` |
| Les articles de conseils | `lib/data/articles.js` |
| Téléphone, email, adresse, horaires, réseaux sociaux | `lib/constants.js` |

## Ajouter des photos

Déposez vos images dans le sous-dossier correspondant de `public/images/` (`exterieur/`, `interieur/`, `avant-apres/`, `equipe/`), avec un nom de fichier descriptif (ex. `porsche-911-polissage-angers.jpg` — utile pour le SEO), puis ajoutez l'entrée correspondante dans `app/galerie/page.js` (ou dans les tableaux `EXTERIOR_PHOTOS` / `INTERIOR_PHOTOS`).
