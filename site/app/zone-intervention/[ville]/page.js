import { notFound } from 'next/navigation'
import Link from 'next/link'
import PageHero from '@/components/PageHero'
import FormulaCard from '@/components/FormulaCard'
import GoogleMapEmbed from '@/components/GoogleMapEmbed'
import FAQAccordion from '@/components/FAQAccordion'
import JsonLd from '@/components/JsonLd'
import StaticBeforeAfterGallery from '@/components/StaticBeforeAfterGallery'
import ComparisonTable from '@/components/ComparisonTable'
import { IconMapPin, IconClock, IconShield, IconArrowRight, IconPhone, IconStar, IconGoogleG } from '@/components/Icons'
import { CITIES, STANDALONE_CITIES, HOME_CITY_SLUG, getCity, cityHref } from '@/lib/data/cities'
import { getCityContent, SERVICE_CITY_PITCH } from '@/lib/data/cityContent'
import { FORMULAS } from '@/lib/data/services'
import { SERVICE_PAGES } from '@/lib/data/servicePages'
import { FAQ_ITEMS } from '@/lib/data/faq'
import { BEFORE_AFTER_PAIRS } from '@/lib/data/beforeAfter'
import { REVIEWS, AGGREGATE_RATING } from '@/lib/data/reviews'
import { FORMULAS_PRICING } from '@/lib/data/pricing'
import { CONTACT, telLink } from '@/lib/constants'
import { buildMetadata } from '@/lib/seo'
import { breadcrumbSchema, faqPageSchema, cityServiceSchema } from '@/lib/schema'
import styles from './page.module.css'

// Décale les sélections (réalisations, avis) d'une commune à l'autre pour que
// deux pages voisines n'affichent pas exactement les mêmes éléments.
function pick(list, count, offset) {
  return Array.from({ length: Math.min(count, list.length) }, (_, i) => list[(offset + i) % list.length])
}

// Seules les communes avec une page dédiée sont générées. Angers (portée par la
// page d'accueil) et les communes regroupées sur /zone-intervention/communes-voisines
// sont redirigées en amont (next.config.mjs) ; toute autre valeur renvoie un 404.
export const dynamicParams = false

export function generateStaticParams() {
  return STANDALONE_CITIES.map((c) => ({ ville: c.slug }))
}

export async function generateMetadata({ params }) {
  const { ville } = await params
  const city = getCity(ville)
  if (!city) return {}

  const fromPrice = FORMULAS_PRICING[0].prices.citadine
  return buildMetadata({
    title: `Nettoyage voiture à domicile à ${city.name} dès ${fromPrice} €`,
    description: `Nettoyage voiture à domicile à ${city.name} : intérieur dès ${fromPrice} €, extérieur, lustrage, phares, céramique. Sans frais de déplacement, avis ${AGGREGATE_RATING.ratingValue}/5 sur Google, devis en ligne.`,
    path: `/zone-intervention/${city.slug}`,
  })
}

export default async function VillePage({ params }) {
  const { ville } = await params
  const city = getCity(ville)
  if (!city || city.grouped || city.slug === HOME_CITY_SLUG) notFound()

  const otherCities = CITIES.filter((c) => c.slug !== city.slug)
  const local = getCityContent(city.slug)
  const cityIndex = STANDALONE_CITIES.findIndex((c) => c.slug === city.slug)
  // FAQ propre à la commune d'abord, puis 2 questions générales.
  const faqItems = [...(local?.faq ?? []), ...FAQ_ITEMS.slice(3, 4), ...FAQ_ITEMS.slice(5, 6)]
  // Prestations mises en avant pour cette commune d'abord, puis toutes les autres.
  const focus = local?.focus ?? []
  const services = [
    ...focus.map((slug) => SERVICE_PAGES.find((s) => s.slug === slug)).filter(Boolean),
    ...SERVICE_PAGES.filter((s) => !focus.includes(s.slug)),
  ]
  // 5 paires : remplit exactement la grille (1 grande carte + 4)
  const pairs = pick(BEFORE_AFTER_PAIRS, 5, cityIndex * 5)
  const reviews = pick(
    // Avis de clients uniquement (pas ceux de la famille du gérant).
    REVIEWS.filter((r) => r.text.length > 90 && !r.author.includes('Soldet')),
    3,
    cityIndex * 3
  )

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
      <JsonLd data={cityServiceSchema(city, services)} />

      <PageHero
        eyebrow={`Detailing automobile à ${city.name}`}
        title={`Nettoyage de voiture à domicile à ${city.name}`}
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

      <section className="section">
        <div className="container">
          <div className={styles.grid}>
            <div className={styles.pointList}>
              <div className={styles.point}>
                <IconMapPin size={18} />
                <span>
                  Intervention directement à votre domicile ou sur votre lieu de travail à{' '}
                  {city.name}, sans surcoût de déplacement dans notre zone habituelle
                  {city.distanceKm ? ` (${city.distanceKm} km d'Angers)` : ''}.
                </span>
              </div>
              {local?.sectors?.length > 0 && (
                <div className={styles.point}>
                  <IconMapPin size={18} />
                  <span>
                    Secteurs couverts à {city.name} : {local.sectors.join(', ')}.
                  </span>
                </div>
              )}
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

      <section className="section section-alt">
        <div className="container">
          <div className={styles.sectionHead}>
            <span className="eyebrow">Nos prestations à {city.name}</span>
            <h2>Tout l&apos;entretien de votre voiture, sans bouger de {city.name}</h2>
            <p className={styles.sectionLead}>
              Mêmes prestations et mêmes tarifs qu&apos;à Angers, déplacement inclus.
            </p>
          </div>
          <div className={styles.serviceGrid}>
            {services.map((s) => (
              <Link href={`/prestations/${s.slug}`} className={styles.serviceCard} key={s.slug}>
                <h3>
                  {s.name} à {city.name}
                </h3>
                <span className={styles.servicePrice}>{s.priceLine}</span>
                <p>{SERVICE_CITY_PITCH[s.slug]}</p>
                <span className={styles.serviceMore}>
                  En savoir plus <IconArrowRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className={styles.sectionHead}>
            <span className="eyebrow">Nettoyage intérieur à {city.name}</span>
            <h2>Nos deux formules habitacle</h2>
          </div>
          <div className={styles.formulaGrid}>
            {FORMULAS.map((f) => (
              <FormulaCard formula={f} key={f.id} />
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className={styles.sectionHead}>
            <span className="eyebrow">Nos réalisations</span>
            <h2>Avant / après : le résultat d&apos;un nettoyage La Clean Compagny</h2>
            <p className={styles.sectionLead}>
              Quelques véhicules nettoyés récemment dans l&apos;agglomération angevine.{' '}
              <Link href="/galerie">Voir toute la galerie</Link>
            </p>
          </div>
          <StaticBeforeAfterGallery pairs={pairs} />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className={styles.sectionHead}>
            <span className="eyebrow">Comparer avant de choisir</span>
            <h2>À domicile, en station ou vous-même ?</h2>
          </div>
          <ComparisonTable usLabel={`La Clean Compagny à ${city.name}`} />
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className={styles.sectionHead}>
            <span className="eyebrow">Avis clients</span>
            <h2>
              {AGGREGATE_RATING.ratingValue}/5 sur Google, {AGGREGATE_RATING.reviewCount} avis
            </h2>
          </div>
          <div className={styles.reviewGrid}>
            {reviews.map((r) => (
              <figure className={styles.review} key={r.author}>
                <div className={styles.reviewStars} aria-label={`${r.rating} étoiles sur 5`}>
                  {Array.from({ length: r.rating }, (_, i) => (
                    <IconStar size={14} key={i} />
                  ))}
                </div>
                <blockquote>{r.text}</blockquote>
                <figcaption>{r.author}</figcaption>
              </figure>
            ))}
          </div>
          <a
            href={CONTACT.googleMapsCidUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.reviewLink}
          >
            <IconGoogleG size={16} /> Lire tous les avis sur Google
          </a>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className={styles.sectionHead}>
            <span className="eyebrow">Questions fréquentes</span>
            <h2>Tout savoir avant de réserver à {city.name}</h2>
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
              <Link href={cityHref(c)} className={styles.chip} key={c.slug}>
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
