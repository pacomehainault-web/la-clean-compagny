import { notFound } from 'next/navigation'
import Link from 'next/link'
import PageHero from '@/components/PageHero'
import FormulaCard from '@/components/FormulaCard'
import GoogleMapEmbed from '@/components/GoogleMapEmbed'
import FAQAccordion from '@/components/FAQAccordion'
import JsonLd from '@/components/JsonLd'
import { IconMapPin, IconClock, IconShield, IconArrowRight, IconPhone } from '@/components/Icons'
import { CITIES, STANDALONE_CITIES, HOME_CITY_SLUG, getCity, cityHref } from '@/lib/data/cities'
import { FORMULAS } from '@/lib/data/services'
import { SERVICE_PAGES } from '@/lib/data/servicePages'
import { FAQ_ITEMS } from '@/lib/data/faq'
import { CONTACT, telLink } from '@/lib/constants'
import { buildMetadata } from '@/lib/seo'
import { breadcrumbSchema, faqPageSchema } from '@/lib/schema'
import styles from './page.module.css'

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

  return buildMetadata({
    title: `Nettoyage voiture à domicile à ${city.name}`,
    description: `Nettoyage voiture à domicile à ${city.name} : intérieur, extérieur, lustrage, décontamination. Devis rapide, intervention directement chez vous.`,
    path: `/zone-intervention/${city.slug}`,
  })
}

export default async function VillePage({ params }) {
  const { ville } = await params
  const city = getCity(ville)
  if (!city || city.grouped || city.slug === HOME_CITY_SLUG) notFound()

  const otherCities = CITIES.filter((c) => c.slug !== city.slug)
  const faqItems = FAQ_ITEMS.slice(0, 4)

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

      <section className="section section-alt">
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
