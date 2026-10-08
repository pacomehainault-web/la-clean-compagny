import { notFound } from 'next/navigation'
import Link from 'next/link'
import PageHero from '@/components/PageHero'
import ContentBlocks, { TableOfContents } from '@/components/ContentBlocks'
import FAQAccordion from '@/components/FAQAccordion'
import JsonLd from '@/components/JsonLd'
import {
  IconArrowRight,
  IconDroplet,
  IconSparkle,
  IconShield,
  IconMoto,
  IconEye,
  IconLeaf,
  IconStar,
} from '@/components/Icons'
import { SERVICE_PAGES, getServicePage } from '@/lib/data/servicePages'
import { getArticle } from '@/lib/data/articles'
import { CONTACT, telLink } from '@/lib/constants'
import { buildMetadata } from '@/lib/seo'
import { serviceSchema, faqPageSchema, breadcrumbSchema } from '@/lib/schema'
import styles from './page.module.css'

const ICONS = { IconDroplet, IconSparkle, IconShield, IconMoto, IconEye, IconLeaf, IconStar }

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
        <div className="container" style={{ textAlign: 'center' }}>
          <span className="eyebrow">Angers et {CONTACT.radiusKm} km alentour</span>
          <h2 style={{ marginTop: 14 }}>
            Disponible sur toute notre{' '}
            <Link href="/zone-intervention/angers" className={styles.inlineLink}>
              zone d&apos;intervention à Angers
            </Link>
          </h2>
          <div style={{ marginTop: 28, display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
            <Link href="/devis" className="btn btn-cta">
              Voir les tarifs et réserver
              <IconArrowRight size={18} />
            </Link>
            <a href={telLink()} className="btn btn-outline">
              {CONTACT.phoneDisplay}
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
