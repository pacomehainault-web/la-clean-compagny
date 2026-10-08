import { notFound } from 'next/navigation'
import Link from 'next/link'
import PageHero from '@/components/PageHero'
import FormulaCard from '@/components/FormulaCard'
import GoogleMapEmbed from '@/components/GoogleMapEmbed'
import FAQAccordion from '@/components/FAQAccordion'
import ReviewsCarousel from '@/components/ReviewsCarousel'
import JsonLd from '@/components/JsonLd'
import { IconMapPin, IconClock, IconShield, IconArrowRight, IconPhone } from '@/components/Icons'
import { CITIES, getCity } from '@/lib/data/cities'
import { FORMULAS } from '@/lib/data/services'
import { SERVICE_PAGES } from '@/lib/data/servicePages'
import { FAQ_ITEMS } from '@/lib/data/faq'
import { REVIEWS } from '@/lib/data/reviews'
import { CONTACT, telLink } from '@/lib/constants'
import { buildMetadata } from '@/lib/seo'
import { breadcrumbSchema, faqPageSchema } from '@/lib/schema'
import styles from './page.module.css'

export function generateStaticParams() {
  return CITIES.map((c) => ({ ville: c.slug }))
}

export async function generateMetadata({ params }) {
  const { ville } = await params
  const city = getCity(ville)
  if (!city) return {}

  const isAngers = city.slug === 'angers'

  return buildMetadata({
    title: isAngers
      ? 'Nettoyage voiture Angers à domicile — intérieur & extérieur'
      : `Nettoyage voiture à domicile à ${city.name}`,
    description: isAngers
      ? "Nettoyage de voiture à domicile à Angers : intérieur dès 109 €, extérieur, lustrage, céramique. Tous quartiers, devis rapide, avis 5.0 Google."
      : `Nettoyage voiture à domicile à ${city.name} : intérieur, extérieur, lustrage, decontamination. Devis rapide, intervention directement chez vous.`,
    path: `/zone-intervention/${city.slug}`,
  })
}

// Quelques avis réels (parmi ceux déjà publiés sur le site) sélectionnés pour
// la page Angers, qui concentre l'essentiel de notre activité historique —
// cf. lib/data/reviews.js pour la liste complète et le lien vers la fiche Google.
const ANGERS_REVIEW_AUTHORS = ['Mathieu Belhache', 'Yohann LAURENCE', 'Got Vdb', 'Manon Bézier']

const HOW_IT_WORKS = [
  {
    title: 'Devis',
    text: "Vous décrivez votre véhicule (gabarit, état, prestations souhaitées) et recevez une estimation en quelques minutes, en ligne ou par téléphone.",
  },
  {
    title: 'Rendez-vous',
    text: "Nous convenons ensemble d'un créneau à votre domicile, sur votre lieu de travail, ou tout autre endroit adapté.",
  },
  {
    title: 'Intervention sur place',
    text: "Nous intervenons avec notre propre matériel. Un accès à l'eau et à l'électricité est utile selon la prestation choisie.",
  },
  {
    title: 'Contrôle qualité',
    text: 'Chaque intervention se termine par une vérification minutieuse, pour un résultat conforme à ce qui a été convenu lors du devis.',
  },
]

export default async function VillePage({ params }) {
  const { ville } = await params
  const city = getCity(ville)
  if (!city) notFound()

  const isAngers = city.slug === 'angers'
  const otherCities = CITIES.filter((c) => c.slug !== city.slug).slice(0, 8)
  const faqItems = isAngers ? city.faq : FAQ_ITEMS.slice(0, 4)
  const angersReviews = REVIEWS.filter((r) => ANGERS_REVIEW_AUTHORS.includes(r.author))

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Accueil', path: '/' },
          { name: "Zone d'intervention", path: '/zone-intervention' },
          { name: city.name, path: `/zone-intervention/${city.slug}` },
        ])}
      />
      <JsonLd data={faqPageSchema(faqItems)} />

      <PageHero
        eyebrow={isAngers ? 'Notre port d’attache' : `Detailing automobile à ${city.name}`}
        title={isAngers ? 'Nettoyage de voiture à domicile à Angers' : `Nettoyage automobile haut de gamme à ${city.name}`}
        lead={city.intro}
        breadcrumb={[{ label: "Zone d'intervention", href: '/zone-intervention' }, { label: city.name }]}
      />

      {city.extra?.length > 0 && (
        <section className="section">
          <div className="container">
            <div className={styles.extraProse}>
              {city.extra.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        </section>
      )}

      {isAngers && city.neighborhoods?.length > 0 && (
        <section className="section section-alt">
          <div className="container">
            <div className={styles.sectionHead}>
              <span className="eyebrow">Où intervenons-nous à Angers ?</span>
              <h2>Tous les quartiers, à domicile ou sur votre lieu de travail</h2>
              <p className="lead" style={{ marginTop: 14 }}>
                Du centre-ville aux quartiers résidentiels, nous nous déplaçons partout à Angers,
                sans supplément de déplacement.
              </p>
            </div>
            <div className={styles.neighborhoodGrid}>
              {city.neighborhoods.map((n) => (
                <span className={styles.neighborhoodChip} key={n}>
                  <IconMapPin size={14} />
                  {n}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className={`section ${isAngers ? 'section-alt' : ''}`}>
        <div className="container">
          <div className={styles.grid}>
            <div className={styles.pointList}>
              <div className={styles.point}>
                <IconMapPin size={18} />
                <span>
                  Intervention directement à votre domicile ou sur votre lieu de travail à{' '}
                  {city.name}, sans surcoût de déplacement dans notre zone habituelle.
                </span>
              </div>
              <div className={styles.point}>
                <IconClock size={18} />
                <span>Devis rapide et sans engagement, avec une réponse sous 24h ouvrées.</span>
              </div>
              <div className={styles.point}>
                <IconShield size={18} />
                <span>
                  Le même niveau d&apos;exigence pour tous les véhicules : citadines, berlines,
                  SUV, utilitaires et voitures de prestige.
                </span>
              </div>
            </div>
            <GoogleMapEmbed height={320} />
          </div>
        </div>
      </section>

      <section className={`section ${isAngers ? '' : 'section-alt'}`}>
        <div className="container">
          <div className={styles.sectionHead}>
            <span className="eyebrow">Nos prestations à {city.name}</span>
            <h2>Nos formules habitacle</h2>
          </div>
          <div className={styles.formulaGrid}>
            {FORMULAS.map((f) => (
              <FormulaCard formula={f} key={f.id} />
            ))}
          </div>

          <div className={styles.servicesNote}>
            <span>Et aussi, le détail de chaque prestation :</span>
            <div className={styles.chipRow}>
              {SERVICE_PAGES.map((s) => (
                <Link href={`/prestations/${s.slug}`} className={styles.chip} key={s.slug}>
                  {s.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {isAngers && (
        <section className="section section-alt">
          <div className="container">
            <div className={styles.sectionHead}>
              <span className="eyebrow">Notre méthode</span>
              <h2>Comment se passe une intervention ?</h2>
            </div>
            <div className={styles.stepsGrid}>
              {HOW_IT_WORKS.map((step, i) => (
                <div className={styles.step} key={step.title}>
                  <span className={styles.stepNumber}>{i + 1}</span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {isAngers && (
        <section className="section">
          <div className="container">
            <div className={styles.sectionHead}>
              <span className="eyebrow">La preuve par l&apos;image</span>
              <h2>Réalisations à Angers</h2>
            </div>
            <div className={styles.placeholderGallery}>
              {[1, 2, 3].map((i) => (
                <div className={styles.placeholderCard} key={i}>
                  <div className={styles.placeholderImage}>[À COMPLÉTER : photo de chantier {i} à Angers]</div>
                  <p>[À COMPLÉTER : une phrase décrivant cette intervention à Angers]</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {isAngers && angersReviews.length > 0 && (
        <section className="section section-alt">
          <div className="container">
            <div className={styles.sectionHead}>
              <span className="eyebrow">Avis clients à Angers</span>
              <h2>Ce qu&apos;en disent nos clients</h2>
            </div>
            <ReviewsCarousel reviews={angersReviews} />
            <div className={styles.reviewsFooter}>
              <a href={CONTACT.googleReviewUrl} target="_blank" rel="noopener noreferrer" className="btn btn-cta btn-sm">
                Voir tous nos avis Google
              </a>
              <Link href="/avis" className="btn btn-ghost btn-sm">
                Toute la page avis
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="container">
          <div className={styles.sectionHead}>
            <span className="eyebrow">Questions fréquentes</span>
            <h2>Tout savoir avant de réserver{isAngers ? ' à Angers' : ''}</h2>
          </div>
          <FAQAccordion items={faqItems} />
        </div>
      </section>

      <section className="section section-alt">
        <div className="container" style={{ textAlign: 'center' }}>
          <span className="eyebrow">Prêt à réserver ?</span>
          <h2 style={{ marginTop: 14 }}>Votre devis pour {city.name} en quelques minutes</h2>
          <div style={{ marginTop: 28, display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
            <Link href="/devis" className="btn btn-cta">
              Voir les tarifs et réserver
              <IconArrowRight size={18} />
            </Link>
            <a href={telLink()} className="btn btn-outline">
              <IconPhone size={16} style={{ marginRight: 6, verticalAlign: '-2px' }} />
              {CONTACT.phoneDisplay}
            </a>
          </div>

          <p style={{ marginTop: 40, color: 'var(--color-text-muted)' }}>Autres communes desservies</p>
          <div className={styles.otherCities} style={{ justifyContent: 'center' }}>
            {otherCities.map((c) => (
              <Link href={`/zone-intervention/${c.slug}`} className={styles.chip} key={c.slug}>
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
