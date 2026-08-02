import { notFound } from 'next/navigation'
import Link from 'next/link'
import PageHero from '@/components/PageHero'
import JsonLd from '@/components/JsonLd'
import { IconArrowRight } from '@/components/Icons'
import { ARTICLES, getArticle } from '@/lib/data/articles'
import { buildMetadata } from '@/lib/seo'
import { articleSchema, breadcrumbSchema } from '@/lib/schema'
import styles from './page.module.css'

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const article = getArticle(slug)
  if (!article) return {}

  return buildMetadata({
    title: article.title,
    description: article.metaDescription,
    path: `/conseils/${article.slug}`,
  })
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default async function ArticlePage({ params }) {
  const { slug } = await params
  const article = getArticle(slug)
  if (!article) notFound()

  return (
    <>
      <JsonLd data={articleSchema(article)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Accueil', path: '/' },
          { name: 'Conseils', path: '/conseils' },
          { name: article.title, path: `/conseils/${article.slug}` },
        ])}
      />

      <PageHero
        eyebrow="Conseils d'expert"
        title={article.title}
        breadcrumb={[{ label: 'Conseils', href: '/conseils' }, { label: article.title }]}
      />

      <section className="section">
        <div className="container">
          <article className={styles.article}>
            <div className={styles.meta}>
              <span>{formatDate(article.date)}</span>
              <span>·</span>
              <span>{article.readTime} de lecture</span>
            </div>

            <div className={styles.prose}>
              {article.content.map((block, index) =>
                block.type === 'h2' ? <h2 key={index}>{block.text}</h2> : <p key={index}>{block.text}</p>
              )}
            </div>

            <div className={styles.footer}>
              <p className="lead">Une question, ou envie de prendre rendez-vous ?</p>
              <Link href="/devis" className="btn btn-cta" style={{ marginTop: 20 }}>
                Voir les tarifs et réserver
                <IconArrowRight size={18} />
              </Link>
            </div>
          </article>
        </div>
      </section>
    </>
  )
}
