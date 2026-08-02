import Link from 'next/link'
import PageHero from '@/components/PageHero'
import { IconArrowRight } from '@/components/Icons'
import { ARTICLES } from '@/lib/data/articles'
import { buildMetadata } from '@/lib/seo'
import styles from './page.module.css'

export const metadata = buildMetadata({
  title: 'Conseils d’expert — Entretien & detailing automobile',
  description:
    "Les conseils de La Clean Compagny pour entretenir votre véhicule : polissage, traitement céramique, entretien du cuir, désinfection à l'ozone et plus encore.",
  path: '/conseils',
})

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function ConseilsPage() {
  return (
    <>
      <PageHero
        eyebrow="Conseils d'expert"
        title="Les conseils de La Clean Compagny"
        lead="Nos explications pour comprendre nos prestations, entretenir votre véhicule entre deux rendez-vous, et faire les bons choix pour sa carrosserie ou son habitacle."
        breadcrumb={[{ label: 'Conseils' }]}
      />
      <section className="section">
        <div className="container">
          <div className={styles.grid}>
            {ARTICLES.map((article) => (
              <Link href={`/conseils/${article.slug}`} className={`card ${styles.card}`} key={article.slug}>
                <div className={styles.meta}>
                  <span>{formatDate(article.date)}</span>
                  <span>·</span>
                  <span>{article.readTime} de lecture</span>
                </div>
                <h2>{article.title}</h2>
                <p className={styles.excerpt}>{article.excerpt}</p>
                <span className={styles.readMore}>
                  Lire l&apos;article
                  <IconArrowRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
