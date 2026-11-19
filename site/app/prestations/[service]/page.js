import { notFound } from 'next/navigation'
import Link from 'next/link'
import PageHero from '@/components/PageHero'
import ContentBlocks, { TableOfContents } from '@/components/ContentBlocks'
import FAQAccordion from '@/components/FAQAccordion'
import BeforeAfterSlider from '@/components/BeforeAfterSlider'
import PhotoGallery from '@/components/PhotoGallery'
import JsonLd from '@/components/JsonLd'
import LeadForm from '@/components/LeadForm'
import ComparisonTable from '@/components/ComparisonTable'
import ReviewCards from '@/components/ReviewCards'
import PricingMatrixTable from '@/components/PricingMatrixTable'
import {
  IconArrowRight,
  IconDroplet,
  IconSparkle,
  IconShield,
  IconMoto,
  IconEye,
  IconLeaf,
  IconStar,
  IconCheck,
} from '@/components/Icons'
import { FORMULAS_PRICING, EXTERIOR_PRICING, CORRECTION_PRICING } from '@/lib/data/pricing'
import { SERVICE_PAGES, getServicePage } from '@/lib/data/servicePages'
import { getArticle } from '@/lib/data/articles'
import { CITIES, cityHref } from '@/lib/data/cities'
import { CONTACT, telLink } from '@/lib/constants'
import { buildMetadata } from '@/lib/seo'
import { serviceSchema, faqPageSchema, breadcrumbSchema } from '@/lib/schema'
import styles from './page.module.css'

const ICONS = { IconDroplet, IconSparkle, IconShield, IconMoto, IconEye, IconLeaf, IconStar }

// Grille de prix par gabarit affichée sur la page de la prestation (mêmes
// données que /prestations : rien n'est dupliqué).
const PRICE_GRIDS = {
  'nettoyage-interieur-voiture': { title: 'Nos formules de nettoyage intérieur', rows: FORMULAS_PRICING },
  'lavage-exterieur-domicile': { title: 'Nos formules de lavage extérieur', rows: EXTERIOR_PRICING },
  'lustrage-polissage': { title: 'Nos formules de lustrage et polissage', rows: CORRECTION_PRICING },
}

const QUICK_CHECKS = [
  `Chez vous ou au travail, jusqu'à ${CONTACT.radiusKm} km d'Angers`,
  'Sans frais de déplacement',
  'Réponse sous 24h ouvrées',
  'Prix fixé au devis, sans surprise',
]

export function generateStaticParams() {
  return SERVICE_PAGES.map((s) => ({ service: s.slug }))
}

export async function generateMetadata({ params }) {
  const { service: slug } = await params
  const service = getServicePage(slug)
  if (!service) return {}

  return buildMetadata({
    title: service.metaTitle,
    description: service.metaDescription,
    path: `/prestations/${service.slug}`,
  })
}

export default async function ServiceDetailPage({ params }) {
  const { service: slug } = await params
  const service = getServicePage(slug)
  if (!service) notFound()

  const Icon = ICONS[service.icon]
  const related = (service.relatedServices || []).map(getServicePage).filter(Boolean)
  const relatedArticles = (service.relatedArticles || []).map(getArticle).filter(Boolean)
  const priceGrid = PRICE_GRIDS[service.slug]
  const serviceIndex = SERVICE_PAGES.findIndex((s) => s.slug === service.slug)

  return (
    <>
      <JsonLd data={serviceSchema(service)} />
      <JsonLd data={faqPageSchema(service.faq)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Accueil', path: '/' },
          { name: 'Prestations', path: '/prestations' },
          { name: service.name, path: `/prestations/${service.slug}` },
        ])}
      />

      <PageHero
        eyebrow={`Prestation · ${service.priceLine}`}
        title={service.h1}
        lead={service.directAnswer}
        breadcrumb={[{ label: 'Prestations', href: '/prestations' }, { label: service.name }]}
      />

      {/* Formulaire de rappel tout de suite sous le titre, comme sur les
          sites les mieux classés : le visiteur pressé laisse son numéro. */}
      <section className={`section-tight ${styles.formBand}`}>
        <div className={`container ${styles.formBandInner}`}>
          <div className={styles.formBandText}>
            <span className={styles.formBandPrice}>{service.name} · {service.priceLine}</span>
            <ul className={styles.quickChecks}>
              {QUICK_CHECKS.map((c) => (
                <li key={c}>
                  <IconCheck size={18} />
                  {c}
                </li>
              ))}
            </ul>
            <div className={styles.formBandCtas}>
              <Link href="/devis" className="btn btn-cta">
                Réserver en ligne
                <IconArrowRight size={18} />
              </Link>
              <a href={telLink()} className="btn btn-outline">
                {CONTACT.phoneDisplay}
              </a>
            </div>
          </div>
          <div className={styles.formBandForm}>
            <LeadForm source={`prestation-${service.slug}`} title={`${service.name} : être rappelé`} />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className={styles.layout}>
            <article className={styles.prose}>
              <TableOfContents blocks={service.content} />
              <ContentBlocks blocks={service.content} />
            </article>

            <aside className={styles.sidebar}>
              <div className={styles.sidebarCard}>
                {Icon && (
                  <div className={styles.iconBadge}>
                    <Icon size={26} />
                  </div>
                )}
                <span className={styles.sidebarPrice}>{service.priceLine}</span>
                <Link href="/devis" className="btn btn-cta btn-block">
                  Voir les tarifs et réserver
                  <IconArrowRight size={18} />
                </Link>
                <a href={telLink()} className="btn btn-outline btn-block">
                  {CONTACT.phoneDisplay}
                </a>
              </div>

              {related.length > 0 && (
                <div className={styles.sidebarCard}>
                  <span className={styles.sidebarTitle}>Autres prestations</span>
                  <div className={styles.sidebarLinks}>
                    {related.map((r) => (
                      <Link href={`/prestations/${r.slug}`} key={r.slug}>
                        {r.name}
                        <span>{r.priceLine}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </section>

      {priceGrid && (
        <section className="section section-alt">
          <div className="container">
            <div className={styles.sectionHead}>
              <span className="eyebrow">Tarifs {service.name.toLowerCase()} à Angers</span>
              <h2>{priceGrid.title}</h2>
            </div>
            <PricingMatrixTable services={priceGrid.rows} />
            <p className={styles.priceNote}>
              Prix de départ selon le gabarit du véhicule, déplacement inclus jusqu&apos;à {CONTACT.radiusKm} km
              d&apos;Angers. Le prix exact est confirmé au devis selon l&apos;état du véhicule.
            </p>
          </div>
        </section>
      )}

      {service.realisations && (
        <section className="section">
          <div className="container">
            <div className={styles.sectionHead}>
              <span className="eyebrow">La preuve par l&apos;image</span>
              <h2>Nos réalisations : {service.name.toLowerCase()}</h2>
            </div>
            {service.realisations.pairs?.length > 0 && (
              <div className={styles.realisationsGrid}>
                {service.realisations.pairs.map((pair) => (
                  <div className={styles.realisationCard} key={pair.before}>
                    <BeforeAfterSlider before={pair.before} after={pair.after} alt={pair.alt} />
                    <p className={styles.realisationCaption}>{pair.caption}</p>
                  </div>
                ))}
              </div>
            )}
            {service.realisations.photos?.length > 0 && (
              <div style={{ marginTop: service.realisations.pairs?.length ? 32 : 0 }}>
                <PhotoGallery photos={service.realisations.photos} />
              </div>
            )}
          </div>
        </section>
      )}

      <section className="section section-alt">
        <div className="container">
          <div className={styles.sectionHead}>
            <span className="eyebrow">Avis clients</span>
            <h2>Ils nous ont confié leur voiture</h2>
          </div>
          <ReviewCards offset={serviceIndex * 3} />
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: 1000 }}>
          <div className={styles.sectionHead}>
            <span className="eyebrow">Comparer avant de choisir</span>
            <h2>{service.name} : à domicile, en station ou vous-même ?</h2>
          </div>
          <ComparisonTable />
        </div>
      </section>

      <section className="section section-alt">
        <div className="container" style={{ maxWidth: 820 }}>
          <div className={styles.sectionHead}>
            <span className="eyebrow">Questions fréquentes</span>
            <h2>{service.name} : vos questions</h2>
          </div>
          <FAQAccordion items={service.faq} />
        </div>
      </section>

      {relatedArticles.length > 0 && (
        <section className="section">
          <div className="container">
            <div className={styles.sectionHead}>
              <span className="eyebrow">Pour aller plus loin</span>
              <h2>Nos conseils liés</h2>
            </div>
            <div className={styles.articleLinks}>
              {relatedArticles.map((a) => (
                <Link href={`/conseils/${a.slug}`} className={`card ${styles.articleCard}`} key={a.slug}>
                  <span>{a.title}</span>
                  <IconArrowRight size={16} />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section section-alt">
        <div className={`container ${styles.finalGrid}`}>
        <div className={styles.finalText}>
          <span className="eyebrow">Angers et {CONTACT.radiusKm} km alentour</span>
          <h2 style={{ marginTop: 14 }}>
            Disponible sur toute notre{' '}
            <Link href="/zone-intervention" className={styles.inlineLink}>
              zone d&apos;intervention à Angers
            </Link>
          </h2>
          {/* Maillage interne prestation → communes : chaque commune desservie a
              un lien, pour que Google relie la prestation à toute la zone. */}
          <p style={{ marginTop: 18, color: 'var(--color-text-muted)' }}>
            {service.name} à domicile à :
          </p>
          <div className={styles.cityLinks}>
            {CITIES.map((c) => (
              <Link href={cityHref(c)} className={styles.cityLink} key={c.slug}>
                {c.name}
              </Link>
            ))}
          </div>
          <div style={{ marginTop: 28, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <Link href="/devis" className="btn btn-cta">
              Voir les tarifs et réserver
              <IconArrowRight size={18} />
            </Link>
            <a href={telLink()} className="btn btn-outline">
              {CONTACT.phoneDisplay}
            </a>
          </div>
        </div>
        <div className={styles.finalForm}>
          <LeadForm
            variant="dark"
            source={`prestation-${service.slug}-bas`}
            title="Recevoir mon prix"
            subtitle="Laissez votre numéro, Enzo vous rappelle sous 24h ouvrées."
            withVehicle
          />
        </div>
        </div>
      </section>
    </>
  )
}
