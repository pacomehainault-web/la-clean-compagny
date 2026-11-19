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
import { FORMULAS_PRICING } from '@/lib/data/pricing'
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

export const metadata = buildMetadata({
  title: 'Nettoyage voiture Angers à domicile | La Clean Compagny',
  description: `Nettoyage voiture à domicile à Angers dès ${FROM_PRICE} € : intérieur, extérieur, lustrage, céramique. 30 km autour d'Angers, avis 5.0 ★ Google, rappel sous 24h.`,
  path: '/',
})

// Régénère la page toutes les heures (rotation des avant/après).
export const revalidate = 3600

const ANGERS = getCity(HOME_CITY_SLUG)
const RATING = AGGREGATE_RATING.ratingValue.toFixed(1).replace('.', ',')

const MAIN_SERVICES = [
  { slug: 'nettoyage-interieur-voiture', title: 'Nettoyage intérieur', text: 'Aspiration, plastiques, vitres, tapis, odeurs', img: '/images/interieur/bmw-x7-nettoyage-interieur-angers.jpg', alt: 'Habitacle de BMW X7 nettoyé à domicile à Angers' },
  { slug: 'lavage-exterieur-domicile', title: 'Lavage extérieur', text: 'Lavage manuel, jantes, séchage, devant chez vous', img: '/images/exterieur/bmw-m3-lavage-exterieur-angers.jpg', alt: 'BMW M3 lavée à domicile à Angers' },
  { slug: 'lustrage-polissage', title: 'Lustrage et polissage', text: 'Brillance retrouvée, micro-rayures effacées', img: '/images/lustrage/x1-lustrage-minute-apres.jpg', alt: 'Carrosserie de BMW X1 après un lustrage' },
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

function CtaPair({ dark = false }) {
  return (
    <div className={styles.ctaPair}>
      <Link href="/devis" className={`btn ${dark ? 'btn-cta' : styles.btnWhite}`}>
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
      <JsonLd data={faqPageSchema(ANGERS.faq)} />

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
              src="/images/equipe/enzo-soldet-gerant-la-clean-compagny.jpg"
              alt={`${SITE.gerant}, fondateur de La Clean Compagny`}
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

      {/* 8. FAQ (objections + requête locale) */}
      <section className="section section-alt">
        <div className="container" style={{ maxWidth: 860 }}>
          <div className={styles.sectionHead}>
            <span className="eyebrow">Questions fréquentes</span>
            <h2>Nettoyage de voiture à Angers : vos questions</h2>
          </div>
          <FAQAccordion items={ANGERS.faq} />
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
