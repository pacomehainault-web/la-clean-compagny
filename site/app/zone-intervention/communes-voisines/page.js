import Link from 'next/link'
import PageHero from '@/components/PageHero'
import FormulaCard from '@/components/FormulaCard'
import GoogleMapEmbed from '@/components/GoogleMapEmbed'
import FAQAccordion from '@/components/FAQAccordion'
import JsonLd from '@/components/JsonLd'
import { IconMapPin, IconClock, IconShield, IconArrowRight, IconPhone } from '@/components/Icons'
import { CITIES, GROUPED_CITIES, GROUPED_COMMUNES_PATH, cityHref } from '@/lib/data/cities'
import { FORMULAS } from '@/lib/data/services'
import { SERVICE_PAGES } from '@/lib/data/servicePages'
import { FAQ_ITEMS } from '@/lib/data/faq'
import { FORMULAS_PRICING } from '@/lib/data/pricing'
import { CONTACT, telLink } from '@/lib/constants'
import { buildMetadata } from '@/lib/seo'
import { breadcrumbSchema, faqPageSchema } from '@/lib/schema'
// Même mise en page que les pages ville : on réutilise leur feuille de style
// plutôt que d'en dupliquer une copie.
import styles from '../[ville]/page.module.css'

// Page commune aux communes plus petites de la zone (cf. `grouped: true` dans
// lib/data/cities.js). Chaque commune garde son texte propre, sous un H2 et une
// ancre (#slug) dédiés : les anciennes URL /zone-intervention/<slug>
// redirigent ici (next.config.mjs) et les liens internes pointent sur l'ancre.

const names = GROUPED_CITIES.map((c) => c.name)
const namesList = `${names.slice(0, -1).join(', ')} et ${names[names.length - 1]}`
const fromPrice = FORMULAS_PRICING[0].prices.citadine

export const metadata = buildMetadata({
  title: `Nettoyage voiture à domicile : ${names.join(', ')}`,
  description: `Nettoyage de voiture à domicile à ${namesList} : intérieur dès ${fromPrice} €, extérieur, lustrage, céramique. Sans frais de déplacement, devis rapide.`,
  path: GROUPED_COMMUNES_PATH,
})

const LOCAL_FAQ = [
  {
    question: `Y a-t-il des frais de déplacement pour ${namesList} ?`,
    answer: `Non. Ces communes font partie de notre zone habituelle de ${CONTACT.radiusKm} km autour d'Angers : le déplacement est inclus, quelle que soit la prestation choisie.`,
  },
  ...FAQ_ITEMS.slice(0, 4),
]

export default function CommunesVoisinesPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Accueil', path: '/' },
          { name: "Zone d'intervention", path: '/zone-intervention' },
          { name: 'Communes voisines', path: GROUPED_COMMUNES_PATH },
        ])}
      />
      <JsonLd data={faqPageSchema(LOCAL_FAQ)} />

      <PageHero
        eyebrow="Autour d'Angers"
        title={`Nettoyage de voiture à domicile à ${namesList}`}
        lead={`La Clean Compagny se déplace chez vous à ${namesList}, sans frais de déplacement : nettoyage intérieur dès ${fromPrice} €, lavage extérieur, lustrage et traitement céramique. Devis en ligne en quelques minutes.`}
        breadcrumb={[{ label: "Zone d'intervention", href: '/zone-intervention' }, { label: 'Communes voisines' }]}
      />

      <section className="section">
        <div className="container">
          <div className={styles.extraProse}>
            {GROUPED_CITIES.map((city) => (
              <div id={city.slug} key={city.slug} style={{ scrollMarginTop: 120, marginBottom: 40 }}>
                <h2>Nettoyage voiture à domicile à {city.name}</h2>
                <p style={{ color: 'var(--color-text-muted)', marginTop: 6 }}>
                  <IconMapPin size={14} style={{ marginRight: 6, verticalAlign: '-2px' }} />
                  {`Environ ${city.distanceKm} km d'Angers · déplacement inclus`}
                </p>
                <p>{city.intro}</p>
                {city.extra?.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className={styles.grid}>
            <div className={styles.pointList}>
              <div className={styles.point}>
                <IconMapPin size={18} />
                <span>
                  Intervention à votre domicile ou sur votre lieu de travail, sans surcoût de
                  déplacement dans notre zone habituelle.
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

      <section className="section">
        <div className="container">
          <div className={styles.sectionHead}>
            <span className="eyebrow">Nos prestations autour d&apos;Angers</span>
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

      <section className="section section-alt">
        <div className="container">
          <div className={styles.sectionHead}>
            <span className="eyebrow">Questions fréquentes</span>
            <h2>Tout savoir avant de réserver</h2>
          </div>
          <FAQAccordion items={LOCAL_FAQ} />
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ textAlign: 'center' }}>
          <span className="eyebrow">Prêt à réserver ?</span>
          <h2 style={{ marginTop: 14 }}>Votre devis en quelques minutes</h2>
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
            {CITIES.filter((c) => !c.grouped).map((c) => (
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
