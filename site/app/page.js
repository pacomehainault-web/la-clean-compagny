import Image from 'next/image'
import Link from 'next/link'
import styles from './page.module.css'
import HeroMedia from '@/components/HeroMedia'
import LeadForm from '@/components/LeadForm'
import ReviewsCarousel from '@/components/ReviewsCarousel'
import StaticBeforeAfterGallery from '@/components/StaticBeforeAfterGallery'
import ComparisonTable from '@/components/ComparisonTable'
import FAQAccordion from '@/components/FAQAccordion'
import JsonLd from '@/components/JsonLd'
import { IconArrowRight, IconCheck, IconPhone } from '@/components/Icons'
import { SERVICE_PAGES } from '@/lib/data/servicePages'
import { REVIEWS, AGGREGATE_RATING } from '@/lib/data/reviews'
import { CITIES, HOME_CITY_SLUG, getCity, cityHref } from '@/lib/data/cities'
import { CONTACT, SITE, telLink } from '@/lib/constants'
import { buildMetadata } from '@/lib/seo'
import { faqPageSchema } from '@/lib/schema'
import { getRotatingIndex } from '@/lib/rotatingSelection'
import { FORMULAS_PRICING, EXTERIOR_PRICING, VEHICLE_TIERS, PRICED_TIER_IDS } from '@/lib/data/pricing'
import { FORMULAS } from '@/lib/data/services'
import { BEFORE_AFTER_PAIRS } from '@/lib/data/beforeAfter'

// Page d'accueil « conversion » (refonte de novembre 2026, sur le modèle des
// sites les mieux classés à Angers) : un seul objectif, faire appeler, réserver
// ou laisser son numéro. Ordre volontaire : promesse + formulaire court →
// preuves (note, prestations en photo, gérant, avis, avant/après) → objections
// (comparatif, FAQ) → dernier appel à l'action. Les boutons « Réserver /
// Appeler » reviennent après chaque bloc de preuve.
// L'ancienne version (formules détaillées, lustrage minute, Pass Entretien,
// gabarits, moto…) est sauvegardée sur la branche Git
// `sauvegarde/accueil-ancienne-version` ; ces contenus vivent sur leurs pages
// dédiées (/prestations, /pro…).
//
// La page porte la requête « nettoyage voiture Angers » : elle garde un
// texte local (quartiers, communes, FAQ Angers) et le balisage FAQPage.
// NB : le template de titre du layout ne s'applique pas à la page racine.
const FROM_PRICE = FORMULAS_PRICING[0].prices.citadine

// Titre façon « sites qui sortent premiers » : requête + preuve sociale (note et nombre d'avis,
// tirés de AGGREGATE_RATING pour rester exacts). Le nom de marque est affiché par Google à part.
export const metadata = buildMetadata({
  title: `Nettoyage voiture Angers à domicile | ${AGGREGATE_RATING.ratingValue.toFixed(1).replace('.', ',')}★ · ${AGGREGATE_RATING.reviewCount} avis Google`,
  description: `Nettoyage voiture et lavage auto à domicile à Angers dès ${FROM_PRICE} € : intérieur, extérieur, detailing, lustrage. Jusqu'à 30 km, avis 5,0 ★ Google, réponse sous 24h.`,
  path: '/',
})

// Régénère la page toutes les heures (rotation des avant/après).
export const revalidate = 3600

const ANGERS = getCity(HOME_CITY_SLUG)
const RATING = AGGREGATE_RATING.ratingValue.toFixed(1).replace('.', ',')

const MAIN_SERVICES = [
  { slug: 'nettoyage-interieur-voiture', title: 'Nettoyage intérieur', text: 'Aspiration, plastiques, vitres, tapis, odeurs', img: '/images/interieur/aston-martin-vantage-s-nettoyage-interieur-angers.jpg', alt: 'Habitacle cuir d’Aston Martin Vantage S après un nettoyage intérieur à Angers' },
  { slug: 'lavage-exterieur-domicile', title: 'Lavage extérieur', text: 'Lavage manuel, jantes, séchage, devant chez vous', img: '/images/exterieur/ferrari-lavage-mousse-angers.jpg', alt: 'Ferrari couverte de mousse pendant un lavage extérieur La Clean Compagny à Angers' },
  { slug: 'lustrage-polissage', title: 'Lustrage et polissage', text: 'Brillance retrouvée, micro-rayures effacées', img: '/images/exterieur/porsche-911-gt3-polissage-showroom-angers.jpg', alt: 'Porsche 911 GT3 rouge brillante après un polissage à Angers' },
  { slug: 'renovation-optiques', title: 'Rénovation des phares', text: 'Phares jaunis rendus transparents', img: '/images/lustrage/lustrage-reflet-phare.jpg', alt: 'Reflet sur un phare rénové' },
].map((s) => ({ ...s, priceLine: SERVICE_PAGES.find((p) => p.slug === s.slug)?.priceLine }))

const OTHER_SERVICES = [
  ...SERVICE_PAGES.filter((s) => !MAIN_SERVICES.some((m) => m.slug === s.slug)).map((s) => ({
    href: `/prestations/${s.slug}`,
    label: s.name,
  })),
  { href: '/pro', label: 'Flottes et professionnels' },
]

const HERO_CHECKS = [
  `Sans frais de déplacement (${CONTACT.radiusKm} km)`,
  'Réponse sous 24h ouvrées',
  'Particuliers et professionnels',
]

const TRUST = [
  `${RATING}/5 sur Google (${AGGREGATE_RATING.reviewCount} avis)`,
  `À domicile depuis ${SITE.foundedYear}`,
  `${CITIES.length} communes autour d'Angers`,
  'Contrôle qualité avec vous',
]

const PROMISES = [
  { title: 'Un seul interlocuteur.', text: "Du devis à la fin de l'intervention, c'est Enzo." },
  { title: 'Le prix annoncé avant de venir.', text: 'Fixé au devis selon votre véhicule, sans surprise le jour J.' },
  { title: 'Rien à préparer.', text: "Vous confiez les clés, on s'occupe du reste." },
]

// ---------- « Les points à comparer avant de réserver » ----------
// Bloc d'informations factuelles (contenu, prestations, conditions, tarif, méthode) :
// c'est ce que lisent Google et ses réponses IA pour comparer les prestataires d'une ville.
// Tout vient des données du site (formules, grille de prix) : rien à mettre à jour ici.
const FORMULA_DETAILS = FORMULAS.filter((f) => ['coup-de-propre', 'sortie-concession'].includes(f.id))
const TIER_LABEL = Object.fromEntries(VEHICLE_TIERS.map((t) => [t.id, t.label]))
const PRICE_ROWS = [
  ...FORMULAS_PRICING.map((f) => ({ name: f.name, prices: f.prices, note: f.promo })),
  { name: EXTERIOR_PRICING[0].name, prices: EXTERIOR_PRICING[0].prices },
]

const OFFERED = [
  { href: '/prestations/nettoyage-interieur-voiture', label: 'Nettoyage intérieur de voiture' },
  { href: '/prestations/lavage-exterieur-domicile', label: 'Lavage extérieur à la main' },
  { href: '/prestations/lustrage-polissage', label: 'Lustrage et polissage de carrosserie' },
  { href: '/prestations/renovation-optiques', label: 'Rénovation des phares' },
  { href: '/prestations/desinfection-ozone', label: 'Désinfection à l’ozone (odeurs, tabac, animaux)' },
  { href: '/pro', label: 'Entretien de flottes et véhicules professionnels' },
]

const CONDITIONS = [
  `À votre domicile ou sur votre lieu de travail, à Angers et jusqu'à ${CONTACT.radiusKm} km, sans frais de déplacement.`,
  'Un emplacement accessible suffit : maison, parking de résidence ou d’entreprise.',
  'Selon la prestation, un accès à l’eau et à l’électricité : on en parle au moment du devis.',
  'Votre présence n’est pas obligatoire : vous pouvez simplement confier vos clés.',
  'Du lundi au samedi, sur rendez-vous. S’il pleut, l’intérieur se fait quand même ; l’extérieur peut être décalé sans frais.',
]

const METHODS = [
  'Lavage extérieur à la main : prélavage, lavage manuel, jantes, rinçage et séchage, sans rouleaux ni brosses de station.',
  'Produits professionnels choisis selon chaque matière : plastiques, tissus, cuir, vitres.',
  'Shampouinage des tapis et moquettes, dressing UV des plastiques sur la formule Sortie de Concession.',
  'Décontamination chimique et mécanique de la carrosserie, puis lustrage ou polissage pour effacer les micro-rayures.',
  'Désinfection à l’ozone pour traiter les odeurs à la source plutôt que les masquer.',
  'Contrôle qualité avec vous avant de partir.',
]

const STEPS = [
  { title: 'Votre prix en quelques minutes', text: 'Vous indiquez votre véhicule et la prestation en ligne, ou vous appelez. Le tarif dépend du gabarit et de l’état du véhicule ; il est confirmé avant l’intervention.' },
  { title: 'Un créneau qui vous arrange', text: 'Réponse sous 24h ouvrées, rendez-vous en général dans la semaine. Vous recevez un rappel la veille.' },
  { title: 'Enzo vient chez vous', text: 'Vous suivez son arrivée en direct sur votre page personnelle. Comptez 2 à 3h pour un Coup de Propre, 4 à 6h pour une Sortie de Concession.' },
  { title: 'Contrôle et photos', text: 'On vérifie le résultat ensemble. Vos photos avant / après et votre facture restent disponibles sur votre page.' },
]

// FAQ de l'accueil : celle d'Angers + les questions qu'on nous pose le plus avant de réserver.
const HOME_FAQ = [
  ...ANGERS.faq,
  {
    question: 'Combien de temps dure un nettoyage de voiture ?',
    answer: `Comptez ${FORMULA_DETAILS[0]?.duration || '2h à 3h'} pour un Coup de Propre (nettoyage intérieur complet) et ${FORMULA_DETAILS[1]?.duration || '4h à 6h'} pour une Sortie de Concession (remise en état complète avec lavage extérieur). La durée dépend aussi de l'état du véhicule.`,
  },
  {
    question: 'Quelle différence entre le Coup de Propre et la Sortie de Concession ?',
    answer: "Le Coup de Propre est l'entretien régulier de l'habitacle : aspiration, dépoussiérage, vitres, tapis, désodorisation. La Sortie de Concession reprend tout cela et ajoute le nettoyage en profondeur et le dressing UV des plastiques, le shampouinage des tapis, les recoins (rails de sièges, aérateurs) et le lavage extérieur complet, offert.",
  },
  {
    question: 'Que se passe-t-il s’il pleut le jour du rendez-vous ?',
    answer: "Le nettoyage intérieur se fait normalement. Pour un lavage extérieur, un lustrage ou un polissage, on vous prévient à l'avance si la pluie est annoncée et on décale le créneau, sans frais.",
  },
  {
    question: 'Peut-on offrir un nettoyage de voiture ?',
    answer: 'Oui, avec nos bons cadeaux : vous choisissez la prestation, la personne réserve ensuite le créneau qui lui convient.',
  },
]

function CtaPair({ dark = false }) {
  return (
    <div className={styles.ctaPair}>
      <Link href="/reserver" className={`btn ${dark ? 'btn-cta' : styles.btnWhite}`}>
        Réserver en ligne
        <IconArrowRight size={18} />
      </Link>
      <a href={telLink()} className={`btn ${styles.btnLine}`}>
        <IconPhone size={17} />
        {CONTACT.phoneDisplay}
      </a>
    </div>
  )
}

export default function HomePage() {
  const baseIndex = getRotatingIndex(BEFORE_AFTER_PAIRS.length, { namespace: 'home' })
  const pairs = Array.from({ length: 5 }, (_, i) => BEFORE_AFTER_PAIRS[(baseIndex + i) % BEFORE_AFTER_PAIRS.length])

  return (
    <>
      <JsonLd data={faqPageSchema(HOME_FAQ)} />

      {/* 1. Promesse + preuve + 3 façons de nous contacter */}
      <section className={styles.hero}>
        <HeroMedia
          src="/images/hero/ferrari-lavage-mousse-hero.jpg"
          alt="Ferrari recouverte de mousse active lors d'un lavage La Clean Compagny"
        />
        <div className={styles.heroOverlay} aria-hidden="true" />
        <div className={`container ${styles.heroInner}`}>
          <div className={styles.heroText}>
            <Link href="/avis" className={styles.heroRating}>
              <span className={styles.stars} aria-hidden="true">★★★★★</span>
              <span>
                <strong>{RATING}</strong> sur Google · {AGGREGATE_RATING.reviewCount} avis
              </span>
            </Link>
            <h1 className={styles.heroTitle}>Nettoyage de voiture à domicile à Angers</h1>
            <p className={styles.heroLead}>
              On vient chez vous ou au travail avec tout le matériel. Vous récupérez une voiture propre
              comme au premier jour, sans bouger. Nettoyage intérieur dès {FROM_PRICE} €.
            </p>
            <CtaPair />
            <ul className={styles.heroChecks}>
              {HERO_CHECKS.map((c) => (
                <li key={c}>
                  <IconCheck size={18} />
                  {c}
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.heroForm} id="rappel">
            <LeadForm source="accueil-haut" />
          </div>
        </div>
      </section>

      {/* 2. Bandeau de confiance : uniquement des chiffres vrais */}
      <div className={styles.trust}>
        <div className={`container ${styles.trustInner}`}>
          {TRUST.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
      </div>

      {/* 3. Prestations : grandes photos, un prix, un clic */}
      <section className="section">
        <div className="container">
          <div className={styles.sectionHead}>
            <span className="eyebrow">Nos prestations</span>
            <h2>Ce qu&apos;on fait pour votre voiture, à Angers et alentour</h2>
          </div>
          <div className={styles.serviceGrid}>
            {MAIN_SERVICES.map((s) => (
              <Link href={`/prestations/${s.slug}`} className={styles.serviceCard} key={s.slug}>
                <Image src={s.img} alt={s.alt} fill sizes="(max-width: 700px) 100vw, 300px" className={styles.serviceImg} />
                <span className={styles.serviceShade} aria-hidden="true" />
                <span className={styles.serviceBody}>
                  <span className={styles.servicePrice}>{s.priceLine}</span>
                  <span className={styles.serviceTitle}>{s.title}</span>
                  <span className={styles.serviceText}>{s.text}</span>
                </span>
              </Link>
            ))}
          </div>
          <div className={styles.chips}>
            <span>Et aussi :</span>
            {OTHER_SERVICES.map((o) => (
              <Link href={o.href} className={styles.chip} key={o.href}>
                {o.label}
              </Link>
            ))}
            <Link href="/prestations" className={styles.chipLink}>
              Tous les tarifs
            </Link>
          </div>
        </div>
      </section>

      {/* 3 bis. Les mots que les gens tapent : nettoyage auto, lavage, detailing */}
      <section className="section section-alt">
        <div className="container">
          <div className={styles.sectionHead}>
            <span className="eyebrow">Nettoyage, lavage ou detailing ?</span>
            <h2>Nettoyage auto à Angers : quelle prestation choisir ?</h2>
          </div>
          <div className={styles.words}>
            <div>
              <h3>Nettoyage auto intérieur</h3>
              <p>
                L&apos;habitacle de A à Z : aspiration, plastiques, vitres, tapis, odeurs. C&apos;est le{' '}
                <Link href="/prestations/nettoyage-interieur-voiture">nettoyage intérieur de voiture</Link>, dès {FROM_PRICE} € avec le
                Coup de Propre.
              </p>
            </div>
            <div>
              <h3>Lavage auto à domicile</h3>
              <p>
                La carrosserie lavée à la main devant chez vous, jantes et séchage compris, sans rouleaux de station :
                notre <Link href="/prestations/lavage-exterieur-domicile">lavage extérieur à domicile</Link>, dès{' '}
                {EXTERIOR_PRICING[0].prices.citadine} €.
              </p>
            </div>
            <div>
              <h3>Detailing automobile</h3>
              <p>
                Pour aller plus loin que la propreté : remise en état complète de l&apos;intérieur avec la Sortie de Concession,{' '}
                <Link href="/prestations/lustrage-polissage">lustrage et polissage</Link> de la carrosserie,{' '}
                <Link href="/prestations/traitement-ceramique">traitement céramique</Link> et{' '}
                <Link href="/prestations/renovation-optiques">rénovation des phares</Link>.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.ctaBand}>
        <div className={`container ${styles.ctaBandInner}`}>
          <p className={styles.ctaBandTitle}>Un créneau cette semaine ? Réponse sous 24h.</p>
          <CtaPair />
        </div>
      </section>

      {/* 4. Qui vient chez vous */}
      <section className="section">
        <div className={`container ${styles.about}`}>
          <div className={styles.aboutImg}>
            <Image
              src="/images/equipe/enzo-nettoyage-tapis-la-clean-compagny.jpg"
              alt={`${SITE.gerant}, fondateur de La Clean Compagny, en train de nettoyer un tapis de voiture`}
              fill
              sizes="(max-width: 900px) 100vw, 440px"
            />
          </div>
          <div className={styles.aboutText}>
            <span className="eyebrow">Qui vient chez vous</span>
            <h2>Enzo, fondateur de La Clean Compagny</h2>
            <p>
              Depuis {SITE.foundedYear}, Enzo nettoie les voitures des Angevins à domicile, de la citadine du
              quotidien à la voiture de prestige. C&apos;est lui qui fait votre devis, lui qui vient, lui qui
              vérifie le résultat avec vous avant de partir.
            </p>
            <ul className={styles.promises}>
              {PROMISES.map((p) => (
                <li key={p.title}>
                  <IconCheck size={20} />
                  <span>
                    <strong>{p.title}</strong> {p.text}
                  </span>
                </li>
              ))}
            </ul>
            <Link href="/notre-histoire" className={styles.textLink}>
              Notre histoire <IconArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Avis Google */}
      <section className="section section-alt">
        <div className="container">
          <div className={styles.sectionHead}>
            <span className="eyebrow">Avis clients</span>
            <h2>
              {RATING}/5 sur Google, {AGGREGATE_RATING.reviewCount} avis
            </h2>
          </div>
          <ReviewsCarousel reviews={REVIEWS.filter((r) => !r.author.includes('Soldet'))} />
          <div className={styles.reviewLinks}>
            <a href={CONTACT.googleMapsCidUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
              Lire tous les avis sur Google
            </a>
            <a href={CONTACT.googleReviewUrl} target="_blank" rel="noopener noreferrer" className={styles.textLink}>
              Déjà client ? Laisser un avis
            </a>
          </div>
        </div>
      </section>

      {/* 6. Avant / après */}
      <section className="section">
        <div className="container">
          <div className={styles.sectionHead}>
            <span className="eyebrow">Nos réalisations</span>
            <h2>Avant / après, sans retouche</h2>
          </div>
          <StaticBeforeAfterGallery pairs={pairs} />
          <Link href="/galerie" className={styles.textLink} style={{ marginTop: 22 }}>
            Voir toute la galerie <IconArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section className={`${styles.ctaBand} ${styles.ctaBandDark}`}>
        <div className={`container ${styles.ctaBandInner}`}>
          <div>
            <p className={styles.ctaBandTitle}>La même chose pour votre voiture ?</p>
            <p className={styles.ctaBandSub}>
              Nettoyage intérieur dès {FROM_PRICE} €, déplacement compris jusqu&apos;à {CONTACT.radiusKm} km d&apos;Angers.
            </p>
          </div>
          <CtaPair dark />
        </div>
      </section>

      {/* 7. Comparatif */}
      <section className="section">
        <div className="container" style={{ maxWidth: 1000 }}>
          <div className={styles.sectionHead}>
            <span className="eyebrow">Comparer avant de choisir</span>
            <h2>À domicile, en station ou vous-même ?</h2>
          </div>
          <ComparisonTable />
        </div>
      </section>

      {/* 7 bis. Les points à comparer : contenu, prestations, conditions, tarif, méthode */}
      <section className="section section-alt">
        <div className="container">
          <div className={styles.sectionHead}>
            <span className="eyebrow">Avant de réserver</span>
            <h2>Nettoyage voiture à Angers{'\u00a0'}: les points à comparer</h2>
            <p className={styles.sectionLead}>
              Avant de choisir qui s&apos;occupe de votre voiture, comparez ce qui est vraiment inclus, où et comment
              l&apos;intervention se fait, et le prix final. Voici tout ce que comprend un nettoyage de voiture à domicile
              à Angers avec La Clean Compagny.
            </p>
          </div>
          <div className={styles.points}>
            <article className={styles.pointCard}>
              <h3>Contenu de la prestation</h3>
              {FORMULA_DETAILS.map((f) => (
                <div key={f.id} className={styles.pointFormula}>
                  <p>
                    <strong>{f.name}</strong> ({f.duration}, dès {f.basePrice} €) : {f.tagline.toLowerCase()}.
                  </p>
                  <ul>
                    {f.includes.map((i) => (
                      <li key={i}>
                        <IconCheck size={16} />
                        {i}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </article>

            <article className={styles.pointCard}>
              <h3>Prestations proposées</h3>
              <ul className={styles.pointLinks}>
                {OFFERED.map((o) => (
                  <li key={o.href}>
                    <Link href={o.href}>
                      {o.label} <IconArrowRight size={15} />
                    </Link>
                  </li>
                ))}
              </ul>
              <h3>Conditions d&apos;intervention</h3>
              <ul>
                {CONDITIONS.map((c) => (
                  <li key={c}>
                    <IconCheck size={16} />
                    {c}
                  </li>
                ))}
              </ul>
            </article>

            <article className={`${styles.pointCard} ${styles.pointWide}`}>
              <h3>Tarif</h3>
              <p>
                Prix « à partir de » selon le gabarit, déplacement compris. Le prix final est confirmé au devis selon
                l&apos;état du véhicule. Les véhicules de prestige et de collection sont sur devis.
              </p>
              <div className={styles.priceWrap}>
                <table className={styles.priceTable}>
                  <thead>
                    <tr>
                      <th scope="col">Prestation</th>
                      {PRICED_TIER_IDS.map((t) => (
                        <th scope="col" key={t}>
                          {TIER_LABEL[t]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {PRICE_ROWS.map((r) => (
                      <tr key={r.name}>
                        <th scope="row">
                          {r.name}
                          {r.note && <span className={styles.priceNote}>{r.note}</span>}
                        </th>
                        {PRICED_TIER_IDS.map((t) => (
                          <td key={t}>dès {r.prices[t]} €</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Link href="/prestations" className={styles.textLink}>
                Lustrage, polissage, phares, ozone, céramique : tous les tarifs <IconArrowRight size={16} />
              </Link>
            </article>

            <article className={`${styles.pointCard} ${styles.pointWide}`}>
              <h3>Méthodes et équipements</h3>
              <ul className={styles.pointCols}>
                {METHODS.map((m) => (
                  <li key={m}>
                    <IconCheck size={16} />
                    {m}
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </section>

      {/* 7 ter. Déroulé */}
      <section className="section">
        <div className="container">
          <div className={styles.sectionHead}>
            <span className="eyebrow">Comment ça se passe</span>
            <h2>Votre nettoyage de voiture à domicile, étape par étape</h2>
          </div>
          <ol className={styles.steps}>
            {STEPS.map((st, i) => (
              <li key={st.title}>
                <span className={styles.stepNum}>{i + 1}</span>
                <h3>{st.title}</h3>
                <p>{st.text}</p>
              </li>
            ))}
          </ol>
          <div className={styles.ctaPair}>
            <Link href="/reserver" className="btn btn-cta">
              Réserver en ligne
              <IconArrowRight size={18} />
            </Link>
            <a href={telLink()} className="btn btn-outline">
              <IconPhone size={17} />
              {CONTACT.phoneDisplay}
            </a>
          </div>
        </div>
      </section>

      {/* 8. FAQ (objections + requête locale) */}
      <section className="section section-alt">
        <div className="container" style={{ maxWidth: 860 }}>
          <div className={styles.sectionHead}>
            <span className="eyebrow">Questions fréquentes</span>
            <h2>Nettoyage de voiture à Angers : vos questions</h2>
          </div>
          <FAQAccordion items={HOME_FAQ} />
        </div>
      </section>

      {/* 9. Zone + dernier formulaire */}
      <section className="section">
        <div className={`container ${styles.final}`}>
          <div className={styles.finalText}>
            <span className="eyebrow">Zone d&apos;intervention</span>
            <h2>On vient chez vous, à Angers et jusqu&apos;à {CONTACT.radiusKm} km</h2>
            <p>
              Tous les quartiers d&apos;Angers ({ANGERS.neighborhoods.join(', ')}) et les communes voisines, sans
              frais de déplacement :
            </p>
            <div className={styles.zoneChips}>
              {CITIES.filter((c) => c.slug !== HOME_CITY_SLUG).map((c) => (
                <Link href={cityHref(c)} className={styles.chip} key={c.slug}>
                  {c.name}
                </Link>
              ))}
            </div>
            <a href={telLink()} className={styles.bigPhone}>
              <IconPhone size={26} />
              {CONTACT.phoneDisplay}
            </a>
            <p className={styles.phoneNote}>Appel, SMS ou WhatsApp</p>
          </div>
          <div className={styles.finalForm}>
            <LeadForm variant="dark" source="accueil-bas" title="Recevoir mon prix" subtitle="Laissez votre numéro, Enzo vous rappelle sous 24h ouvrées." withVehicle />
          </div>
        </div>
      </section>
    </>
  )
}
