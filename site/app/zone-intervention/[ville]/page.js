import { notFound } from 'next/navigation'
import Link from 'next/link'
import PageHero from '@/components/PageHero'
import FormulaCard from '@/components/FormulaCard'
import GoogleMapEmbed from '@/components/GoogleMapEmbed'
import FAQAccordion from '@/components/FAQAccordion'
import JsonLd from '@/components/JsonLd'
import { IconMapPin, IconClock, IconShield, IconArrowRight } from '@/components/Icons'
import { CITIES, getCity } from '@/lib/data/cities'
import { FORMULAS } from '@/lib/data/services'
import { FAQ_ITEMS } from '@/lib/data/faq'
import { CONTACT, telLink } from '@/lib/constants'
import { buildMetadata } from '@/lib/seo'
import { breadcrumbSchema } from '@/lib/schema'
import styles from './page.module.css'

export function generateStaticParams() {
  return CITIES.map((c) => ({ ville: c.slug }))
}

export async function generateMetadata({ params }) {
  const { ville } = await params
  const city = getCity(ville)
  if (!city) return {}

  return buildMetadata({
    title: `Detailing automobile à ${city.name} — La Clean Compagny`,
    description: `Nettoyage automobile haut de gamme à ${city.name} : intervention à domicile, formules Coup de Propre et Sortie de Concession, prestations sur devis.`,
    path: `/zone-intervention/${city.slug}`,
  })
}

export default async function VillePage({ params }) {
  const { ville } = await params
  const city = getCity(ville)
  if (!city) notFound()

  const otherCities = CITIES.filter((c) => c.slug !== city.slug).slice(0, 8)

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Accueil', path: '/' },
          { name: "Zone d'intervention", path: '/zone-intervention' },
          { name: city.name, path: `/zone-intervention/${city.slug}` },
        ])}
      />

      <PageHero
        eyebrow={`Detailing automobile à ${city.name}`}
        title={`Nettoyage automobile haut de gamme à ${city.name}`}
        lead={city.intro}
        breadcrumb={[{ label: "Zone d'intervention", href: '/zone-intervention' }, { label: city.name }]}
      />

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
            <span className="eyebrow">Nos formules</span>
            <h2>Nos prestations à {city.name}</h2>
          </div>
          <div className={styles.formulaGrid}>
            {FORMULAS.map((f) => (
              <FormulaCard formula={f} key={f.id} />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className={styles.sectionHead}>
            <span className="eyebrow">Questions fréquentes</span>
            <h2>Tout savoir avant de réserver</h2>
          </div>
          <FAQAccordion items={FAQ_ITEMS.slice(0, 4)} />
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
